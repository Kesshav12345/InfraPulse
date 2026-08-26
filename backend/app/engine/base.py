from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple
from ..database.schemas import RiskAssessmentOutput, CostPrediction, TimePrediction, EarlyWarningItem

class BaseRiskModel(ABC):
    @abstractmethod
    def evaluate(self, timeline_records: List[Dict[str, Any]]) -> RiskAssessmentOutput:
        """Evaluates longitudinal project observations and returns risk assessment."""
        pass

class BasePredictionEngine(ABC):
    @abstractmethod
    def predict_cost(self, timeline_records: List[Dict[str, Any]]) -> CostPrediction:
        """Predicts cost overrun and final cost."""
        pass

    @abstractmethod
    def predict_schedule(self, timeline_records: List[Dict[str, Any]]) -> TimePrediction:
        """Predicts schedule delay and expected completion date."""
        pass
