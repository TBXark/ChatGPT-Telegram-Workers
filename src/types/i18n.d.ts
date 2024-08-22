export interface I18n {
    env: {
        system_init_message: string;
    };
    command: {
        help: {
            summary: string;
            help: string;
            new: string;
            start: string;
            img: string;
            version: string;
            setenv: string;
            setenvs: string;
            delenv: string;
            system: string;
            redo: string;
            echo: string;
        };
        new: {
            new_chat_start: string;
        };
    };
}

export type I18nGenerator = (lang: string) => I18n;
