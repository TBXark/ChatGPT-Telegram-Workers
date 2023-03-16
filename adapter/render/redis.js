import {createClient} from 'redis';

/**
 * Redis缓存
 */
export class RedisCache {
  /**
     * 构造初始化
     * @param {string} url redis链接地址
     */
  constructor(url) {
    this.redis = createClient({url: url});
    this.redis.connect();
  }


  // eslint-disable-next-line valid-jsdoc
  async get(key) {
    return this.redis.get(key);
  }

  // eslint-disable-next-line valid-jsdoc
  async put(key, value, info) {
    const options={};
    if (info && info.expiration) {
      info.expirationTtl = Math.round(info.expiration-Date.now()/1000);
    }
    if (info && info.expirationTtl) {
      options.EX = info.expirationTtl;
    }
    return this.redis.set(key, value, options);
  }

  // eslint-disable-next-line valid-jsdoc
  async delete(key) {
    return this.redis.del(key);
  }
}
