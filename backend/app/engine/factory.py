from .heuristic_model import heuristic_engine
from .base import BaseRiskModel, BasePredictionEngine

def get_risk_model() -> BaseRiskModel:
    """Returns active risk evaluation engine."""
    return heuristic_engine

def get_prediction_engine() -> BasePredictionEngine:
    """Returns active trajectory prediction engine."""
    return heuristic_engine
