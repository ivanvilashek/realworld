import { DataSource } from 'typeorm';
import ormConfig from '@app/ormconfig';
export default new DataSource(ormConfig);
