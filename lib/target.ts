import {PromisifiedRedisClient} from './typings/redis';

import {Command} from './command';

export class Target {
	public service: string;
	public serviceId: string;

	constructor(service: string, serviceId: string, private db: PromisifiedRedisClient) {
		this.service = service;
		this.serviceId = serviceId;
	}

	async getCommand(trigger: string): Promise<Command | null> {
		var commandId = await this.db.hgetAsync(`target:${this.service}:${this.serviceId}:aliases`, trigger);
		if(commandId) return await this.db.hgetallAsync(`target:${this.service}:${this.serviceId}:command:${commandId}`);
		return null;
	}

	async getCommandSettings(commandId: string, defaults: object | null): Promise<object | null> {
		var settings = await this.db.hgetallAsync('target:' + this.service + ':' + this.serviceId + ':command:' + commandId);

		if(!settings) {
			settings = {};
		}

		if(defaults) {
			for(let setting in defaults) {
				if(defaults[setting].default != undefined && settings[setting] == undefined) {
					settings[setting] = defaults[setting].default;
				}

				switch(defaults[setting].type) {
					case 'boolean':
						if(typeof settings[setting] == typeof true) break;

						if(typeof settings[setting] == 'string') {
							settings[setting] = settings[setting].toLowerCase().trim() == 'true';
							break;
						}

						if(settings[setting]) {
							settings[setting] = true;
							break;
						}

						settings[setting] = defaults[setting].default;
						break;

					case 'number':
						if(!isNaN(settings[setting]) && isFinite(settings[setting])) break;
						settings[setting] = parseInt(settings[setting]);
						if(!isNaN(settings[setting]) && isFinite(settings[setting])) break;
						settings[setting] = defaults[setting].default;
						break;

					case 'string':
						if(typeof settings[setting] == 'string') break;
						settings[setting] = String(settings[setting]);
						break;					
				}
			}
		}
		return settings;
	}

	async getName(): Promise<string> {
		return await this.db.hgetAsync('target:' + this.service + ':' + this.serviceId, 'username');
	}

	async getPlugins(): Promise<string[]> {
		return await this.db.smembersAsync(`target:${this.service}:${this.serviceId}:plugins`);
	}

	async isPluginEnabled(plugin: string): Promise<boolean> {
		var result = await this.db.sismemberAsync('target:' + this.service + ':' + this.serviceId + ':plugins', plugin);
		return (result == 1) ? true : false;
	}
}