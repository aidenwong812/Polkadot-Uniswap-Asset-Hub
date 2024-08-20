module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "eslint-config-prettier",
        "plugin:jsx-a11y/recommended",
    ],
    plugins: ["react", "react-hooks", "@typescript-eslint", "jsx-a11y"],
    settings: {
        react: {
            version: "detect",
        },
        camelcase: [
            "error",
            {
                allow: [],
            },
        ],
        eqeqeq: "error",
        "spaced-comment": "error",
        "no-empty-interface": "off",
        "no-var-requires": "off",
        "no-duplicate-imports": "error",
        "react-hooks/rules-of-hooks": "error",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "error",
        "arrow-spacing": "error",
        "block-spacing": "error",
        "react/display-name": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        quotes: ["error", "double"],
        "react/jsx-no-bind": [
            "error",
            {
                allowArrowFunctions: true,
                allowBind: false,
                ignoreRefs: true,
            },
        ],
        "import/resolver": {
            node: {
                paths: ["src"],
                extensions: [".js", ".jsx", ".ts", ".tsx"],
            },
        },
    },
    rules: {
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/no-explicit-any": "off",
    },
};