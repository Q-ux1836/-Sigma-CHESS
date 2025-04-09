
from setuptools import setup, find_packages

setup(
    name="Sigma-Chess",
    version="1.0.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "flask>=2.0.1",
        "Pillow>=8.3.1",
        "PyQt5>=5.15.4",
        "PyInstaller>=4.5.1",
    ],
    entry_points={
        "console_scripts": [
            "sigma-chess=main:main",
        ],
    },
    author="User",
    description="Sigma Chess - A Python Chess Game",
    keywords="chess, game, python",
    url="",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: End Users/Desktop",
        "Programming Language :: Python :: 3",
        "Topic :: Games/Entertainment :: Board Games",
    ],
    python_requires=">=3.6",
)
