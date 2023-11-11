import ormConfig from './ormconfig';

const ormSeedConfig = {
  ...ormConfig,
  migrations: [__dirname + '/seeds/**/*.ts'],
};

export default ormSeedConfig;
