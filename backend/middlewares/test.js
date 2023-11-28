const obj={"error": {
    "errors": {
        "price": {
            "name": "ValidatorError",
            "message": "Path `price` is required.",
            "properties": {
                "message": "Path `price` is required.",
                "type": "required",
                "path": "price",
                "value": null
            },
            "kind": "required",
            "path": "price",
            "value": null
        }
    },
    "_message": "Product validation failed",
    "statusCode": 500,
    "name": "ValidationError",
    "message": "Product validation failed: price: Path `price` is required."
}
}
console.log(Object.values(obj).map(value=>value.message));
