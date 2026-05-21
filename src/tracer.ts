import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { resourceFromAttributes } from '@opentelemetry/resources';
// ✅ แก้ไขตรงนี้เป็น ATTR_SERVICE_NAME (ไม่มีตัว s แล้วครับ)
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const traceExporter = new OTLPTraceExporter({
  url: 'http://jaeger:4317',
});

export const otelSDK = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'nestjs-backend-service',
  }),
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(() => console.log('SDK shut down successfully'))
    .catch((error: unknown) => console.log('Error shutting down SDK', error)) // ✅ ใส่ : unknown ป้องกัน Unsafe จาก ESLint
    .finally(() => process.exit(0));
});
