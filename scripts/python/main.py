#!/usr/bin/env python3
"""
Temozonia Python Scripts Entry Point
Ejemplos de scripts Python que pueden ejecutarse en el edge via Pyodide/Workers AI
"""

import json
import sys
from datetime import datetime
from typing import Any, Dict, List


def process_product_data(products: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Procesa datos de productos para analytics"""
    if not products:
        return {"total": 0, "categories": {}, "price_stats": {}}

    categories = {}
    prices = []

    for product in products:
        cat = product.get("category", "unknown")
        categories[cat] = categories.get(cat, 0) + 1
        if "price" in product:
            prices.append(product["price"])

    price_stats = {}
    if prices:
        price_stats = {
            "min": min(prices),
            "max": max(prices),
            "avg": sum(prices) / len(prices),
            "count": len(prices),
        }

    return {
        "total": len(products),
        "categories": categories,
        "price_stats": price_stats,
        "processed_at": datetime.utcnow().isoformat(),
    }


def generate_recommendations(user_history: List[str], all_products: List[Dict[str, Any]], limit: int = 5) -> List[Dict[str, Any]]:
    """Genera recomendaciones simples basadas en historial"""
    viewed_categories = set()
    for product_id in user_history:
        product = next((p for p in all_products if p.get("id") == product_id), None)
        if product:
            viewed_categories.add(product.get("category", ""))

    recommendations = [
        p for p in all_products
        if p.get("category") in viewed_categories and p.get("id") not in user_history
    ]

    return recommendations[:limit]


def calculate_shipping(cart_total: float, destination: str, weight: float = 0) -> Dict[str, Any]:
    """Calcula costos de envío"""
    zones = {
        "national": {"base": 5.99, "per_kg": 1.50, "free_threshold": 50},
        "international": {"base": 19.99, "per_kg": 5.00, "free_threshold": 200},
    }

    zone = zones.get(destination.lower(), zones["national"])
    shipping_cost = zone["base"] + (weight * zone["per_kg"])

    if cart_total >= zone["free_threshold"]:
        shipping_cost = 0

    return {
        "shipping_cost": round(shipping_cost, 2),
        "free_shipping": shipping_cost == 0,
        "threshold": zone["free_threshold"],
        "remaining_for_free": max(0, zone["free_threshold"] - cart_total),
    }


def main():
    """Punto de entrada principal para testing local"""
    if len(sys.argv) < 2:
        print(json.dumps({
            "available_functions": [
                "process_product_data",
                "generate_recommendations",
                "calculate_shipping"
            ],
            "usage": "python main.py <function_name> [args...]"
        }, indent=2))
        return

    function_name = sys.argv[1]

    if function_name == "process_product_data":
        sample_products = [
            {"id": "1", "name": "Laptop", "category": "electronics", "price": 999.99},
            {"id": "2", "name": "Mouse", "category": "electronics", "price": 29.99},
            {"id": "3", "name": "Camiseta", "category": "clothing", "price": 19.99},
        ]
        result = process_product_data(sample_products)
        print(json.dumps(result, indent=2))

    elif function_name == "calculate_shipping":
        result = calculate_shipping(75.0, "national", 2.5)
        print(json.dumps(result, indent=2))

    else:
        print(json.dumps({"error": f"Unknown function: {function_name}"}, indent=2))


if __name__ == "__main__":
    main()