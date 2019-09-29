import {PromisifiedRedisClient} from './typings/redis';

import {Target} from './target';
import {Users} from './users';

export class Targets {
	private users: Users;

	constructor(private db: PromisifiedRedisClient) {
		this.users = new Users(db);
	}

	async checkAuth(userId: string, targetService: string, targetServiceId: string): Promise<boolean> {
		var serviceId = await this.users.getServiceIdByUserId(userId, targetService);
		if(!serviceId) return false;

		if(targetServiceId === serviceId) return true;

		var isAuthorized = await this.db.sismemberAsync(`target:${targetService}:${targetServiceId}:permissions`, serviceId);
		if(isAuthorized) return true;

		return false;
	}

	getByServiceId(service: string, serviceId: string): Target {
		return new Target(service, serviceId, this.db);
	}
}