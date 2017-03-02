module.exports = {
    "env": {
        "browser": true
    },
    "extends": ["eslint:recommended", "plugin:requirejs/recommended"],
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "requirejs/no-invalid-define": 2,
        "requirejs/no-multiple-define": 2,
        "requirejs/no-named-define": 2,
        "requirejs/no-commonjs-wrapper": 2,
        "requirejs/no-object-define": 1,
        "no-unused-vars": 0
    },
    "plugins": [
        "requirejs"
    ]
};
