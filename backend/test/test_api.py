from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["platform"] == "NEUROARM"

    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

def test_robot_state_and_poses():
    res = client.get("/api/robot/state")
    assert res.status_code == 200
    data = res.json()
    assert "joints" in data
    assert "end_effector" in data

    # Set pose
    res_pose = client.post("/api/robot/pose", json={"pose": "REACH"})
    assert res_pose.status_code == 200
    assert res_pose.json()["status"] == "SUCCESS"

def test_eeg_channels():
    res = client.get("/api/eeg/channels")
    assert res.status_code == 200
    assert "Fp1" in res.json()["channels"]

def test_ml_models_info():
    res = client.get("/api/models/")
    assert res.status_code == 200
    assert "Random Forest" in res.json()["available_architectures"]
