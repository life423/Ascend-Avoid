from setuptools import setup, find_packages

setup(
    name="cipher_tools",
    version="1.0.0",
    description="A collection of classical cipher implementations",
    author="Cipher Team",
    author_email="team@ciphertools.example",
    packages=find_packages(),
    install_requires=[
        'pytest',
        'pyinstaller',
    ],
    python_requires='>=3.6',
    entry_points={
        'console_scripts': [
            'cipher_tool=cipher_tool:main',
            'cipher_gui=cipher_gui:main',
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
