const http = require('http');
const { buildSessionExportBundle } = require('./fhirBundleBuilder');

async function processExportPayload(payload, options = {}) {
  const bundleResult = buildSessionExportBundle(payload);
  const response = {
    delivery_status: 'blocked',
    mode: options.fhirBaseUrl ? 'transaction' : 'dry_run',
    bundle_result: bundleResult,
    transaction_response: null
  };

  if (!bundleResult.bundle_json) {
    return {
      statusCode: 422,
      body: Object.assign(response, {
        delivery_status: 'blocked'
      })
    };
  }

  if (bundleResult.validation_report && !bundleResult.validation_report.valid) {
    return {
      statusCode: 422,
      body: Object.assign(response, {
        delivery_status: 'validation_failed'
      })
    };
  }

  if (!options.fhirBaseUrl) {
    return {
      statusCode: 200,
      body: Object.assign(response, {
        delivery_status: 'dry_run_ready'
      })
    };
  }

  const fetchImpl = options.fetchImpl || global.fetch;
  if (typeof fetchImpl !== 'function') {
    return {
      statusCode: 500,
      body: Object.assign(response, {
        delivery_status: 'server_misconfigured',
        transaction_response: {
          error: 'No fetch implementation is available for FHIR transaction delivery.'
        }
      })
    };
  }

  try {
    const transactionResponse = await fetchImpl(options.fhirBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json'
      },
      body: JSON.stringify(bundleResult.bundle_json)
    });

    const text = await transactionResponse.text();
    let parsed = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch (error) {
      parsed = { raw: text };
    }

    return {
      statusCode: transactionResponse.ok ? 200 : 502,
      body: Object.assign(response, {
        delivery_status: transactionResponse.ok ? 'delivered' : 'transaction_failed',
        transaction_response: {
          status: transactionResponse.status,
          ok: transactionResponse.ok,
          body: parsed
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: Object.assign(response, {
        delivery_status: 'transaction_failed',
        transaction_response: {
          error: error.message
        }
      })
    };
  }
}

function createServer(options = {}) {
  return http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (req.method !== 'POST' || req.url !== '/api/fhir/bundle') {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk;
    });

    req.on('end', async () => {
      let payload;
      try {
        payload = rawBody ? JSON.parse(rawBody) : {};
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        return;
      }

      const result = await processExportPayload(payload, options);
      res.writeHead(result.statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result.body, null, 2));
    });
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 8787);
  const fhirBaseUrl = process.env.FHIR_SERVER_URL || '';
  const server = createServer({ fhirBaseUrl });
  server.listen(port, () => {
    console.log('FHIR delivery server listening on http://localhost:' + port);
    if (fhirBaseUrl) {
      console.log('FHIR transaction target:', fhirBaseUrl);
    } else {
      console.log('FHIR delivery server is running in dry-run mode.');
    }
  });
}

module.exports = {
  processExportPayload,
  createServer
};
