from app.safety.safety_guard import SafetyGuard

def test_confidence_threshold_rejection():
    guard = SafetyGuard()
    guard.confidence_threshold = 80.0
    
    # Low confidence command should be rejected
    is_safe, msg = guard.validate_intent("LEFT", 65.0)
    assert not is_safe
    assert "below safety threshold" in msg
    
    # High confidence command should be accepted
    is_safe, msg = guard.validate_intent("LEFT", 92.0)
    assert is_safe

def test_emergency_stop_priority():
    guard = SafetyGuard()
    guard.trigger_emergency_stop("Test alert")
    assert guard.emergency_stop_latched
    
    # Even high confidence commands must be blocked during emergency stop
    is_safe, msg = guard.validate_intent("FORWARD", 99.0)
    assert not is_safe
    assert "Emergency stop is active" in msg
    
    # Motion clamping must return static joints
    current = {"J1": 10.0, "J2": 20.0, "J3": 30.0, "J4": 0.0, "J5": 0.0, "J6": 50.0}
    target = {"J1": 50.0, "J2": 60.0, "J3": 70.0, "J4": 10.0, "J5": 10.0, "J6": 100.0}
    clamped, allowed = guard.validate_and_clamp_motion(current, target)
    assert not allowed
    assert clamped["J1"] == current["J1"]
    
    # Clear stop
    guard.reset_emergency_stop()
    assert not guard.emergency_stop_latched
