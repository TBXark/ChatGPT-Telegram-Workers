export class Router {
    constructor({ base = '', routes = [], ...other } = {}) {
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

    async fetch(request, ...args) {
        const url = new URL(request.url);
        request.query = this.parseQueryParams(url.searchParams);
        request.method = request.method.toUpperCase();
        for (const [method, regex, handlers, path] of this.routes) {
            if ((method === request.method || method === 'ALL') && url.pathname.match(regex)) {
                request.params = url.pathname.match(regex)?.groups || {};
                request.route = path;
                for (const handler of handlers) {
                    const response = await handler(request.proxy ?? request, ...args);
                    if (response != null) return response;
                }
            }
        }
    }

    route(method, path, ...handlers) {
        const route = this.normalizePath(this.base + path);
        const regex = this.createRouteRegex(route);
        this.routes.push([method.toUpperCase(), regex, handlers, route]);
        return this;
    }

    get(path, ...handlers) {
        return this.route('GET', path, ...handlers);
    }

    post(path, ...handlers) {
        return this.route('POST', path, ...handlers);
    }

    put(path, ...handlers) {
        return this.route('PUT', path, ...handlers);
    }

    delete(path, ...handlers) {
        return this.route('DELETE', path, ...handlers);
    }

    patch(path, ...handlers) {
        return this.route('PATCH', path, ...handlers);
    }

    head(path, ...handlers) {
        return this.route('HEAD', path, ...handlers);
    }

    options(path, ...handlers) {
        return this.route('OPTIONS', path, ...handlers);
    }

    all(path, ...handlers) {
        return this.route('ALL', path, ...handlers);
    }
}