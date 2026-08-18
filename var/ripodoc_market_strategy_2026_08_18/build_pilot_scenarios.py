from __future__ import annotations

import json

interviews = 15
problem_threshold = 8
qualified_pilots = 5
paid_threshold = 3
price_tests_usd = (250, 500, 1000)

results = {
    "inputs": {
        "founder_interviews": interviews,
        "recurring_problem_threshold": problem_threshold,
        "qualified_design_partner_offers": qualified_pilots,
        "minimum_paid_pilots": paid_threshold,
        "monthly_price_tests_usd_per_msp": list(price_tests_usd),
    },
    "conversion_thresholds": {
        "problem_frequency_rate": problem_threshold / interviews,
        "paid_pilot_rate_from_qualified_offers": paid_threshold / qualified_pilots,
        "paid_pilot_rate_from_interviews": paid_threshold / interviews,
    },
    "monthly_revenue_thresholds": [
        {
            "monthly_price_usd": price,
            "minimum_paid_pilots": paid_threshold,
            "minimum_monthly_recurring_revenue_usd": price * paid_threshold,
            "five_paid_pilot_monthly_recurring_revenue_usd": price * qualified_pilots,
        }
        for price in price_tests_usd
    ],
    "interpretation": "All values are decision thresholds and price-test scenarios, not forecasts, company performance, or market-size estimates.",
}

print(json.dumps(results, indent=2))
