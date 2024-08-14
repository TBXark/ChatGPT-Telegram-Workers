/**
 * A simple router implementation.
 * 基于itty-router的路由实现,使用更加可读的方式重写
 */
export class Router {
    constructor({base = '', routes = [], ...other} = {}) {
        this.routes = routes;
        this.base = base;
        Object.assign(this, other);
    }

    /**
     * @private
     * @param {URLSearchParams} searchParams
     * @returns {object}
     */
    parseQueryParams(searchParams) {
        const query = Object.create(null);
        for (const [k, v] of searchParams) {
            query[k] = k in query ? [].concat(query[k], v) : v;
        }
        return query;
    }

    /**
     * @private
     * @param {string} path
     * @returns {string}
     */
    normalizePath(path) {
        return path.replace(/\/+(\/|$)/g, '$1');
    }

    /**
     * @private
     * @param {string} path
     * @returns {RegExp}
     */
    createRouteRegex(path) {
        return RegExp(`^${path
            .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))') // greedy params
            .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))') // named params and image format
            .replace(/\./g, '\\.') // dot in path
            .replace(/(\/?)\*/g, '($1.*)?') // wildcard
        }/*$`);
    }

    /**
     * @param {Request} request
     * @param  {...any} args
     * @returns {Promise<Response|null>}
     */
    async fetch(request, ...args) {
        const url = new URL(request.url);
        const reqMethod = request.method.toUpperCase();
        request.query = this.parseQueryParams(url.searchParams);
        for (const [method, regex, handlers, path] of this.routes) {
            let match = null;
            if ((method === reqMethod || method === 'ALL') && (match = url.pathname.match(regex))) {
                request.params = match?.groups || {};
                request.route = path;
                for (const handler of handlers) {
                    const response = await handler(request.proxy ?? request, ...args);
                    if (response != null) return response;
                }
            }
        }
    }

    /**
     * @param {string} method
     * @param {string} path
     * @param  {...any} handlers
     * @returns {Router}
     */
    route(method, path, ...handlers) {
        const route = this.normalizePath(this.base + path);
        const regex = this.createRouteRegex(route);
        this.routes.push([method.toUpperCase(), regex, handlers, route]);
        return this;
    }

    /**
     * @param {string} path
     * @param  {...any} handlers
     * @returns {Router}
     */
    get(path, ...handlers) {
        return this.route('GET', path, ...handlers);
    }

    /**
     * @param {string} path
     * @param  {...any} handlers
     * @returns {Router}
     */
    post(path, ...handlers) {
        return this.route('POST', path, ...handlers);
    }

    /**
     * @param {string} path
     * @param  {...any} handlers
     * @returns {Router}
     */
    put(path, ...handlers) {
        return this.route('PUT', path, ...handlers);
    }

    /**
     * @param {string} path
     * @param  {...any} handlers
     * @returns {Router}
     */
    delete(path, ...handlers) {
        return this.route('DELETE', path, ...handlers);
    }

    /**
     * @param {string} path
     * @param  {...any} handlers
     * @returns {Router}
     */
    patch(path, ...handlers) {
        return this.route('PATCH', path, ...handlers);
    }

    /**
     * @param {string} path
     * @param  {...any} handlers
     * @returns {Router}
     */
    head(path, ...handlers) {
        return this.route('HEAD', path, ...handlers);
    }

    /**
     * @param {string} path
     * @param  {...any} handlers
     * @returns {Router}
     */
    options(path, ...handlers) {
        return this.route('OPTIONS', path, ...handlers);
    }

    /**
     * @param {string} path
     * @param  {...any} handlers
     * @returns {Router}
     */
    all(path, ...handlers) {
        return this.route('ALL', path, ...handlers);
    }
}