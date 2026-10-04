from pathlib import Path
import subprocess
import sys
import shutil

root = Path(__file__).resolve().parent
for task in ['quiz-build.py','fineprint-build.py','fraud-build.py','spot-build.py',
             'roles/decision-build.py','roles/conversation-build.py','roles/story-build.py',
             'interview/interview-build.py','insurance/insurance-build.py','build-site.py']:
    subprocess.run([sys.executable,str(root/'work/finance'/task)],check=True)
shutil.copytree(root/'outputs/hkchat-finance',root/'site',dirs_exist_ok=True)
print('HKChat Finance rebuilt into site/')
