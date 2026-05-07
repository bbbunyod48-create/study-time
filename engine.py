from datetime import datetime, timedelta
from typing import List, Dict

class NeuroEngine:
    @staticmethod
    def calculate_circadian_zones(wake_time: str, sleep_time: str):
        """
        Logic: Wake + 2h to +6h = Peak (Deep Work)
               Wake + 6h to +9h = Trough (Admin/Light Work)
               Wake + 9h to +12h = Recovery (Critical Review)
        """
        fmt = "%H:%M"
        wake = datetime.strptime(wake_time, fmt)
        
        zones = {
            "peak": {
                "start": (wake + timedelta(hours=2)).strftime(fmt),
                "end": (wake + timedelta(hours=6)).strftime(fmt),
                "label": "Deep Work Zone",
                "color": "#00f2ff"
            },
            "trough": {
                "start": (wake + timedelta(hours=6)).strftime(fmt),
                "end": (wake + timedelta(hours=9)).strftime(fmt),
                "label": "Light Review Zone",
                "color": "#ff00e5"
            },
            "recovery": {
                "start": (wake + timedelta(hours=9)).strftime(fmt),
                "end": (wake + timedelta(hours=12)).strftime(fmt),
                "label": "Critical Review Zone",
                "color": "#adff00"
            }
        }
        return zones

    @staticmethod
    def ai_prioritize(task_title: str) -> str:
        """Parses keywords to assign Eisenhower Quadrant"""
        critical_kw = ["exam", "urgent", "critical", "deadline", "asap"]
        important_kw = ["study", "project", "learn", "growth", "exercise"]
        
        title = task_title.lower()
        if any(kw in title for kw in critical_kw): return "Q1" # Urgent & Important
        if any(kw in title for kw in important_kw): return "Q2" # Important, Not Urgent
        if "email" in title or "call" in title: return "Q3"     # Urgent, Not Important
        return "Q4" # Not Urgent, Not Important