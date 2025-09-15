from typing import List, Dict, Any
from ..schemas import UserBalance, SettlementSuggestion

def calculate_group_balances(expenses: List[Dict[str, Any]], users: List[Dict[str, Any]]) -> tuple[List[UserBalance], List[SettlementSuggestion]]:
    """
    Calculate balances for each user in a group and suggest minimal settlements.
    
    Args:
        expenses: List of group expenses with splits
        users: List of users in the group
    
    Returns:
        Tuple of (user_balances, settlement_suggestions)
    """
    # Initialize balances for each user
    balances = {user['id']: 0.0 for user in users}
    user_names = {user['id']: user['name'] for user in users}
    
    # Calculate what each user owes vs what they paid
    for expense in expenses:
        paid_by = expense['paid_by_user_id']
        amount = expense['amount']
        splits = expense['splits']
        
        # Calculate total weight for normalization
        total_weight = sum(split['weight'] for split in splits)
        
        # Add to what the payer paid
        balances[paid_by] += amount
        
        # Subtract what each user owes based on their weight
        for split in splits:
            user_id = split['user_id']
            weight = split['weight']
            owed_amount = (weight / total_weight) * amount
            balances[user_id] -= owed_amount
    
    # Convert to UserBalance objects
    user_balances = [
        UserBalance(user_id=user_id, user_name=user_names[user_id], balance=balance)
        for user_id, balance in balances.items()
    ]
    
    # Calculate minimal settlements
    settlements = calculate_minimal_settlements(balances, user_names)
    
    return user_balances, settlements

def calculate_minimal_settlements(balances: Dict[int, float], user_names: Dict[int, str]) -> List[SettlementSuggestion]:
    """
    Calculate the minimal number of transactions needed to settle all debts.
    Uses a greedy algorithm to minimize the number of transactions.
    """
    # Separate creditors (positive balance) and debtors (negative balance)
    creditors = [(user_id, balance) for user_id, balance in balances.items() if balance > 0]
    debtors = [(user_id, -balance) for user_id, balance in balances.items() if balance < 0]
    
    # Sort by amount (largest first)
    creditors.sort(key=lambda x: x[1], reverse=True)
    debtors.sort(key=lambda x: x[1], reverse=True)
    
    settlements = []
    i = j = 0
    
    while i < len(creditors) and j < len(debtors):
        creditor_id, creditor_amount = creditors[i]
        debtor_id, debtor_amount = debtors[j]
        
        # Calculate settlement amount
        settlement_amount = min(creditor_amount, debtor_amount)
        
        if settlement_amount > 0.01:  # Only settle if amount is significant
            settlements.append(SettlementSuggestion(
                from_user_id=debtor_id,
                to_user_id=creditor_id,
                amount=round(settlement_amount, 2)
            ))
        
        # Update amounts
        creditors[i] = (creditor_id, creditor_amount - settlement_amount)
        debtors[j] = (debtor_id, debtor_amount - settlement_amount)
        
        # Move to next creditor/debtor if current one is settled
        if creditors[i][1] < 0.01:
            i += 1
        if debtors[j][1] < 0.01:
            j += 1
    
    return settlements
