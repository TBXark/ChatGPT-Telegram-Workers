import { errorToString } from '../../route/utils';

export type QueryParams = Record<string, string | string[]>;
export type RouterRequest = Request & {
    query?: QueryParams;
    params?: Record<string, any>;
    route?: string;
};

type RouterHandler = (req: RouterRequest, ...args: any) => Promise<Response | null> | Response | null;

export class Router {
    private readonly routes: [string, RegExp, RouterHandler[], string][];
    private readonly base: string;
    errorHandler: (req: RouterRequest, error: Error) => Promise<Response> | Response = async (req, error) => new Response(errorToString(error), { status: 500 });

    constructor({ base = '', routes = [], ...other } = {}) {
        this.routes = routes;
        this.base = base;
        Object.assign(this, other);
        this.fetch = this.fetch.bind(this);
        this.route = this.route.bind(this);
        this.get = this.get.bind(this);
        this.post = this.post.bind(this);
        this.put = this.put.bind(this);
        this.delete = this.delete.bind(this);
        this.patch = this.patch.bind(this);
        this.head = this.head.bind(this);
        this.options = this.options.bind(this);
        this.all = this.all.bind(this);
    }

    private parseQueryParams(searchParams: URLSearchParams): QueryParams {
        const query: QueryParams = {};
        searchParams.forEach((v, k) => {
            query[k] = k in query ? [...(Array.isArray(query[k]) ? query[k] : [query[k]]), v] : v;
        });
        return query;
    }

    private normalizePath(path: string): string {
        return path.replace(/\/+(\/|$)/g, '$1');
    }

    private createRouteRegex(path: string): RegExp {
        return new RegExp(`^${path
            .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))') // greedy params
            .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))') // named params and image format
            .replace(/\./g, '\\.') // dot in path
            .replace(/(\/?)\*/g, '($1.*)?') // wildcard
        }/*$`);
    }

    async fetch(request: RouterRequest, ...args: any): Promise<Response> {
        try {
            const url = new URL(request.url);
            const reqMethod = request.method.toUpperCase();
            request.query = this.parseQueryParams(url.searchParams);
            for (const [method, regex, handlers, path] of this.routes) {
                let match = null;
                // eslint-disable-next-line no-cond-assign
                if ((method === reqMethod || method === 'ALL') && (match = url.pathname.match(regex))) {
                    request.params = match?.groups || {};
                    request.route = path;
                    for (const handler of handlers) {
                        const response = await handler(request, ...args);
                        if (response != null) {
                            return response;
                        }
                    }
                }
            }
            return new Response('Not Found', { status: 404 });
        } catch (e) {
            return this.errorHandler(request, e as Error);
        }
    }

    route(method: string, path: string, ...handlers: RouterHandler[]): Router {
        const route = this.normalizePath(this.base + path);
        const regex = this.createRouteRegex(route);
        this.routes.push([method.toUpperCase(), regex, handlers, route]);
        return this;
    }

    get(path: string, ...handlers: RouterHandler[]): Router {
        return this.route('GET', path, ...handlers);
    }

    post(path: string, ...handlers: RouterHandler[]): Router {
        return this.route('POST', path, ...handlers);
    }

    put(path: string, ...handlers: RouterHandler[]): Router {
        return this.route('PUT', path, ...handlers);
    }

    delete(path: string, ...handlers: RouterHandler[]): Router {
        return this.route('DELETE', path, ...handlers);
    }

    patch(path: string, ...handlers: RouterHandler[]): Router {
        return this.route('PATCH', path, ...handlers);
    }

    head(path: string, ...handlers: RouterHandler[]): Router {
        return this.route('HEAD', path, ...handlers);
    }

    options(path: string, ...handlers: RouterHandler[]): Router {
        return this.route('OPTIONS', path, ...handlers);
    }

    all(path: string, ...handlers: RouterHandler[]): Router {
        return this.route('ALL', path, ...handlers);
    }
}
