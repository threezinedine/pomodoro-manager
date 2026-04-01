import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

// Load the OpenAPI spec from the YAML file
const rawSpec = readFileSync(join(__dirname, '../openapi.yaml'), 'utf-8');
const swaggerSpec = yaml.load(rawSpec) as object;

export { swaggerSpec, swaggerUi };
