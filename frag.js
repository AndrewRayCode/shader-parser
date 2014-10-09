{
    "value": "=",
    "arity": "binary",
    "first": {
        "value": "main",
        "arity": "name"
    },
    "second": {
        "value": "function",
        "arity": "function",
        "first": [],
        "second": [
            {
                "value": "=",
                "arity": "binary",
                "first": {
                    "value": "vNormal",
                    "arity": "name"
                },
                "second": {
                    "value": "(",
                    "arity": "binary",
                    "first": {
                        "value": "normalize",
                        "arity": "name"
                    },
                    "second": [
                        {
                            "value": "*",
                            "arity": "binary",
                            "first": {
                                "value": "normalMatrix",
                                "arity": "name"
                            },
                            "second": {
                                "value": "normal",
                                "arity": "name"
                            }
                        }
                    ]
                }
            },
            {
                "value": "=",
                "arity": "binary",
                "first": {
                    "value": "vNormel",
                    "arity": "name"
                },
                "second": {
                    "value": "(",
                    "arity": "binary",
                    "first": {
                        "value": "normalize",
                        "arity": "name"
                    },
                    "second": [
                        {
                            "value": "*",
                            "arity": "binary",
                            "first": {
                                "value": "normalMatrix",
                                "arity": "name"
                            },
                            "second": {
                                "value": "viewVector",
                                "arity": "name"
                            }
                        }
                    ]
                }
            },
            {
                "value": "=",
                "arity": "binary",
                "first": {
                    "value": "intensity",
                    "arity": "name"
                },
                "second": {
                    "value": "(",
                    "arity": "binary",
                    "first": {
                        "value": "pow",
                        "arity": "name"
                    },
                    "second": [
                        {
                            "value": "-",
                            "arity": "binary",
                            "first": {
                                "value": "c",
                                "arity": "name"
                            },
                            "second": {
                                "value": "(",
                                "arity": "binary",
                                "first": {
                                    "value": "dot",
                                    "arity": "name"
                                },
                                "second": [
                                    {
                                        "value": "vNormal",
                                        "arity": "name"
                                    },
                                    {
                                        "value": "vNormel",
                                        "arity": "name"
                                    }
                                ]
                            }
                        },
                        {
                            "value": "p",
                            "arity": "name"
                        }
                    ]
                }
            },
            {
                "value": "=",
                "arity": "binary",
                "first": {
                    "value": "gl_Position",
                    "arity": "name"
                },
                "second": {
                    "value": "*",
                    "arity": "binary",
                    "first": {
                        "value": "*",
                        "arity": "binary",
                        "first": {
                            "value": "projectionMatrix",
                            "arity": "name"
                        },
                        "second": {
                            "value": "modelViewMatrix",
                            "arity": "name"
                        }
                    },
                    "second": {
                        "value": "(",
                        "arity": "binary",
                        "first": {
                            "value": "vec4",
                            "arity": "name"
                        },
                        "second": [
                            {
                                "value": "position",
                                "arity": "name"
                            },
                            {
                                "value": 1,
                                "arity": "literal"
                            }
                        ]
                    }
                }
            }
        ]
    }
}
