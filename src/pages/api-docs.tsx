/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetStaticProps } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import apiSpec from '../swagger/apiSpec';

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
    apiFolder: 'src/pages/api',
    definition: apiSpec,
  });

  return {
    props: {
      spec,
    },
  };
};

export default ApiDoc; 