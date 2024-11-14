interface HelpI18n {
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
    models: string;
    echo: string;
}

export interface I18n {
    env: {
        system_init_message: string;
    };
    command: {
        help: HelpI18n & Record<string, string>;
        new: {
            new_chat_start: string;
        };
    };
    callback_query: {
        open_model_list: string;
        select_provider: string;
        select_model: string;
        change_model: string;
    };
}
