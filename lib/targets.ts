import {Target} from './target';
import {PromisifiedRedisClient} from './typings/redis';

export class Targets {	
	constructor(private db: PromisifiedRedisClient) {}

	getByServiceId(service: string, serviceId: string): Target {
		return new Target(service, serviceId, this.db);
	}
}