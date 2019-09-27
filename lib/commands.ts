import {Command} from './command';
import {PromisifiedRedisClient} from './typings/redis';

export class Commands {	
	constructor(private db: PromisifiedRedisClient) {}

	async addAlias(service: string, serviceId: string, alias: string, commandId: string): Promise<void> {
		return new Promise<void>(async (resolve) => {
			await this.db.hsetAsync(`target:${service}:${serviceId}:aliases`, alias, commandId);

			resolve();
		});
	}

	async create(service: string, serviceId: string, handler: string): Promise<Command> {
		return new Promise<Command>(async (resolve) => {
			var commandId = Math.random().toString(36).slice(-10);

			await Promise.all([
				this.db.saddAsync(`target:${service}:${serviceId}:commands`, commandId),
				this.db.hsetAsync(`target:${service}:${serviceId}:command:${commandId}`, 'id', commandId),
				this.db.hsetAsync(`target:${service}:${serviceId}:command:${commandId}`, 'handler', handler)
			]);
			// await this.db.hsetAsync(`target:${service}:${serviceId}:commands`, )

			var user = await this.db.hgetallAsync(`target:${service}:${serviceId}:command:${commandId}`);

			resolve(user);
		});
	}

	async getAliases(service: string, serviceId: string): Promise<object> {
		return new Promise<object>(async (resolve) => {
			var aliases = await this.db.hgetallAsync(`target:${service}:${serviceId}:aliases`);

			resolve(aliases || {});
		});
	}

	async getAll(service: string, serviceId: string): Promise<object> {
		return new Promise<object>(async (resolve) => {
			var commands = await this.db.smembersAsync(`target:${service}:${serviceId}:commands`);
			var result = {};

			for(var commandId of commands) {
				var command = await this.db.hgetallAsync(`target:${service}:${serviceId}:command:${commandId}`);
				result[commandId] = command;
			}

			resolve(result);
		});
	}
}