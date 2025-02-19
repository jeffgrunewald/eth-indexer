import { GetStaticProps } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic<{
  spec: Record<string, any>;
}>(import('swagger-ui-react'), { ssr: false });

interface Props {
  spec: Record<string, any>;
}

function ApiDoc({ spec }: Props) {
  return <SwaggerUI spec={spec} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const spec = createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'ERC-20 Transfer Event Indexer API',
        version: '1.0.0',
        description: 'API for querying indexed ERC-20 transfer events'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local development server'
        }
      ],
    },
  });

  return {
    props: {
      spec,
    },
  };
};

export default ApiDoc; 