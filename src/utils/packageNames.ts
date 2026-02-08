// Popular PyPI packages for typo detection and suggestions
export const POPULAR_PACKAGES: string[] = [
  // Web Frameworks
  'django',
  'flask',
  'fastapi',
  'tornado',
  'sanic',
  'quart',
  'starlette',
  'falcon',
  'bottle',
  'pyramid',
  'web2py',
  'aiohttp',
  
  // Data Science & ML
  'numpy',
  'pandas',
  'scipy',
  'matplotlib',
  'seaborn',
  'scikit-learn',
  'tensorflow',
  'pytorch',
  'torch',
  'keras',
  'xgboost',
  'lightgbm',
  'catboost',
  'pillow',
  'opencv-python',
  'scikit-image',
  'statsmodels',
  'plotly',
  'bokeh',
  'altair',
  
  // HTTP & API
  'requests',
  'httpx',
  'urllib3',
  'aiohttp',
  'httplib2',
  'treq',
  'httpie',
  
  // Testing
  'pytest',
  'pytest-django',
  'pytest-cov',
  'coverage',
  'tox',
  'nose',
  'nose2',
  'hypothesis',
  'mock',
  'responses',
  'factory-boy',
  
  // CLI & Development Tools
  'click',
  'typer',
  'argparse',
  'docopt',
  'fire',
  'cement',
  'black',
  'flake8',
  'pylint',
  'mypy',
  'bandit',
  'isort',
  'autopep8',
  'yapf',
  'pre-commit',
  
  // Database
  'sqlalchemy',
  'peewee',
  'tortoise-orm',
  'pony',
  'django',
  'psycopg2',
  'psycopg2-binary',
  'pymongo',
  'redis',
  'pymysql',
  'sqlite3',
  'alembic',
  
  // Async & Concurrency
  'asyncio',
  'trio',
  'anyio',
  'aiohttp',
  'fastapi',
  'tornado',
  'celery',
  'gevent',
  'eventlet',
  
  // Web Scraping
  'beautifulsoup4',
  'requests',
  'scrapy',
  'selenium',
  'lxml',
  'html5lib',
  'pyquery',
  'mechanize',
  
  // Data Validation & Parsing
  'pydantic',
  'marshmallow',
  'cerberus',
  'voluptuous',
  'jsonschema',
  'pyyaml',
  'toml',
  'python-dateutil',
  'python-dotenv',
  'configparser',
  'click',
  
  // Authentication & Security
  'bcrypt',
  'passlib',
  'cryptography',
  'pyjwt',
  'oauthlib',
  'requests-oauthlib',
  'authlib',
  'itsdangerous',
  'python-jose',
  
  // Environment & Configuration
  'python-dotenv',
  'environs',
  'dynaconf',
  'python-decouple',
  'confuse',
  
  // Logging & Monitoring
  'structlog',
  'loguru',
  'sentry-sdk',
  'prometheus-client',
  'statsd',
  'datadog',
  
  // Utilities
  'six',
  'python-dateutil',
  'pytz',
  'pendulum',
  'arrow',
  'dateparser',
  'jinja2',
  'markupsafe',
  'werkzeug',
  'blinker',
  'simplejson',
  'ujson',
  'orjson',
  'msgpack',
  'protobuf',
  'grpcio',
  'attrs',
  'cattrs',
  'dataclasses',
  'typing-extensions',
  'mypy-extensions',
  'pathlib',
  'pathspec',
  'watchdog',
  'pyinotify',
  'chardet',
  'charset-normalizer',
  'fsspec',
  's3fs',
  'gcsfs',
  'adlfs',
  
  // Scientific Computing
  'sympy',
  'networkx',
  'igraph',
  'biopython',
  'rpy2',
  'astropy',
  'sunpy',
  'h5py',
  'netcdf4',
  'zarr',
  'dask',
  'xarray',
  
  // Documentation
  'sphinx',
  'sphinx-rtd-theme',
  'mkdocs',
  'pdoc',
  'pdoc3',
  
  // Packaging & Distribution
  'setuptools',
  'wheel',
  'twine',
  'build',
  'pip',
  'poetry',
  'pipenv',
  'hatch',
  'flit',
  'pdm',
  
  // Jupyter & Notebooks
  'jupyter',
  'jupyterlab',
  'ipython',
  'ipywidgets',
  'notebook',
  'nbconvert',
  'nbformat',
  
  // Other Popular Libraries
  'tqdm',
  'rich',
  'colorama',
  'termcolor',
  'tabulate',
  'prettytable',
  'pyparsing',
  'regex',
  're2',
  'lxml',
  'defusedxml',
  'xmltodict',
  'feedparser',
  'python-slugify',
  'python-magic',
  'filetype',
  'mimetypes',
  'mimetools',
  'hashlib',
  'hmac',
  'secrets',
  'uuid',
  'shortuuid',
  'nanoid',
  'faker',
  'factory-boy',
  'freezegun',
  'time-machine',
  'tenacity',
  'backoff',
  'retrying',
  'retry',
  'timeout-decorator',
  'stopit',
  'multiprocessing',
  'joblib',
  'loky',
  'pebble',
  'billiard',
  'kombu',
  'amqp',
  'pika',
  'pyrabbitmq',
]

// Package name aliases (common typos or variations)
export const PACKAGE_ALIASES: Record<string, string> = {
  // Django variations
  'djago': 'django',
  'djnago': 'django',
  
  // Flask variations
  'flsk': 'flask',
  'flassk': 'flask',
  'flaskk': 'flask',
  
  // FastAPI variations
  'fastpi': 'fastapi',
  'fast-api': 'fastapi',
  'fastapii': 'fastapi',
  
  // Requests variations
  'reqeusts': 'requests',
  'reqests': 'requests',
  'requestss': 'requests',
  
  // Numpy variations
  'numy': 'numpy',
  'numpyy': 'numpy',
  'nunpy': 'numpy',
  
  // Pandas variations
  'pands': 'pandas',
  'pandasss': 'pandas',
  'pandass': 'pandas',
  
  // TensorFlow variations
  'tensorflow': 'tensorflow',
  'tensorflw': 'tensorflow',
  'tensor-flow': 'tensorflow',
  
  // PyTorch variations
  'pytorh': 'pytorch',
  'pytorrch': 'pytorch',
  'torch': 'torch',
  
  // Matplotlib variations
  'matplotlib': 'matplotlib',
  'matplotlb': 'matplotlib',
  'matplotib': 'matplotlib',
  
  // Scikit-learn variations
  'sklearn': 'scikit-learn',
  'scikitlearn': 'scikit-learn',
  'scikit-learn': 'scikit-learn',
  
  // BeautifulSoup variations
  'beautifulsoup': 'beautifulsoup4',
  'beautiful-soup': 'beautifulsoup4',
  'bs4': 'beautifulsoup4',
  
  // SQLAlchemy variations
  'sqlalchmy': 'sqlalchemy',
  'sql-alchemy': 'sqlalchemy',
  'sqlachemy': 'sqlalchemy',
  
  // Psycopg2 variations
  'psycopg': 'psycopg2',
  'psycopg2-binary': 'psycopg2-binary',
  
  // Pillow variations
  'pil': 'pillow',
  'pilloww': 'pillow',
  
  // Black variations
  'blak': 'black',
  'blackk': 'black',
  
  // Pytest variations
  'pytes': 'pytest',
  'pytestt': 'pytest',
  'py-test': 'pytest',
  
  // Coverage variations
  'coverag': 'coverage',
  'coveragee': 'coverage',
  
  // Click variations
  'clik': 'click',
  'clickk': 'click',
  
  // Tornado variations
  'tornad': 'tornado',
  'tornadoo': 'tornado',
  
  // aiohttp variations
  'aiohtp': 'aiohttp',
  'aio-http': 'aiohttp',
  'aiohttpp': 'aiohttp',
  
  // Jinja2 variations
  'jinja': 'jinja2',
  'jinja2': 'jinja2',
  'jinja-2': 'jinja2',
  
  // Werkzeug variations
  'werkzeug': 'werkzeug',
  'werzeug': 'werkzeug',
  'werkzeu': 'werkzeug',
  
  // Celery variations
  'celeryy': 'celery',
  'celary': 'celery',
  
  // Redis variations
  'rediss': 'redis',
  'redsi': 'redis',
  
  // PyMongo variations
  'pymong': 'pymongo',
  'pymongoo': 'pymongo',
  
  // Sphinx variations
  'spinx': 'sphinx',
  'sphinxx': 'sphinx',
  
  // Mypy variations
  'mypi': 'mypy',
  'mypyy': 'mypy',
  
  // Pylint variations
  'pylnt': 'pylint',
  'pylintt': 'pylint',
  
  // Flake8 variations
  'flakee': 'flake8',
  'flake-8': 'flake8',
  
  // Isort variations
  'isortt': 'isort',
  'isrt': 'isort',
  
  // Tqdm variations
  'tqmd': 'tqdm',
  'tqdmm': 'tqdm',
  
  // Rich variations
  'richh': 'rich',
  'ricch': 'rich',
  
  // Pydantic variations
  'pydantic': 'pydantic',
  'pydatic': 'pydantic',
  'pydantc': 'pydantic',
  
  // Marshmallow variations
  'marshmallow': 'marshmallow',
  'marshmalloww': 'marshmallow',
  'mrshmallow': 'marshmallow',
  
  // Bcrypt variations
  'bcryptt': 'bcrypt',
  'bcrpt': 'bcrypt',
  
  // Cryptography variations
  'cryptograpy': 'cryptography',
  'cryptograph': 'cryptography',
  'cryptographyy': 'cryptography',
  
  // PyJWT variations
  'pyjwt': 'pyjwt',
  'pyjwt-jwt': 'pyjwt',
  
  // Setuptools variations
  'setuptols': 'setuptools',
  'setuptool': 'setuptools',
  
  // Wheel variations
  'weel': 'wheel',
  'wheell': 'wheel',
  
  // IPython variations
  'ipython': 'ipython',
  'ipythn': 'ipython',
  
  // Jupyter variations
  'jupyte': 'jupyter',
  'jupter': 'jupyter',
  'jupyterr': 'jupyter',
  
  // OpenCV variations
  'opencv': 'opencv-python',
  'opencv-python': 'opencv-python',
  'cv2': 'opencv-python',
  
  // Seaborn variations
  'seabrn': 'seaborn',
  'seabornn': 'seaborn',
  
  // Sympy variations
  'simpy': 'sympy',
  'sympyy': 'sympy',
  
  // Networkx variations
  'network': 'networkx',
  'networkxx': 'networkx',
  
  // H5py variations
  'h5py': 'h5py',
  'h5ppy': 'h5py',
  
  // Dask variations
  'daskk': 'dask',
  'das': 'dask',
  
  // Xarray variations
  'xarrayy': 'xarray',
  'xaray': 'xarray',
  
  // Plotly variations
  'ploty': 'plotly',
  'plotlyy': 'plotly',
  
  // Bokeh variations
  'bokehh': 'bokeh',
  'bokh': 'bokeh',
  
  // Altair variations
  'altir': 'altair',
  'altairr': 'altair',
  
  // Scrapy variations
  'scrapy': 'scrapy',
  'scrapyy': 'scrapy',
  'scrappy': 'scrapy',
  
  // Selenium variations
  'selenium': 'selenium',
  'seleniu': 'selenium',
  'seleniumm': 'selenium',
  
  // Dateutil variations
  'dateutil': 'python-dateutil',
  'python-dateutil': 'python-dateutil',
  
  // Pytz variations
  'pytzz': 'pytz',
  'ptz': 'pytz',
  
  // Pendulum variations
  'pendulu': 'pendulum',
  'pendulumm': 'pendulum',
  
  // Arrow variations
  'arow': 'arrow',
  'arroww': 'arrow',
  
  // Attrs variations
  'attrs': 'attrs',
  'attr': 'attrs',
  
  // Cattrs variations
  'cattrs': 'cattrs',
  'catrs': 'cattrs',
  
  // Watchdog variations
  'watchdog': 'watchdog',
  'watchdg': 'watchdog',
  
  // Chardet variations
  'chardett': 'chardet',
  'chrdet': 'chardet',
  
  // Fsspec variations
  'fsspc': 'fsspec',
  'fsspecc': 'fsspec',
  
  // Joblib variations
  'joblb': 'joblib',
  'joblibb': 'joblib',
  
  // Kombu variations
  'kombbu': 'kombu',
  'kombuu': 'kombu',
  
  // Pika variations
  'pikka': 'pika',
  'pikaa': 'pika',
  
  // Tenacity variations
  'tenacity': 'tenacity',
  'tenaciy': 'tenacity',
  
  // Backoff variations
  'backoff': 'backoff',
  'bakoff': 'backoff',
  
  // Faker variations
  'fakr': 'faker',
  'faker-r': 'faker',
  
  // Freezegun variations
  'freezegun': 'freezegun',
  'freezgun': 'freezegun',
  'freeze-gun': 'freezegun',
  
  // Time-machine variations
  'time-machine': 'time-machine',
  'timemachine': 'time-machine',
  
  // Pebble variations
  'peble': 'pebble',
  'pebbble': 'pebble',
  
  // Billiard variations
  'billard': 'billiard',
  'billiardd': 'billiard',
  
  // Amqp variations
  'ampq': 'amqp',
  'amqpp': 'amqp',
  
  // S3fs variations
  's3fs': 's3fs',
  's3-fsspec': 's3fs',
  
  // Gcsfs variations
  'gcsfs': 'gcsfs',
  'gcs-fsspec': 'gcsfs',
  
  // Adlfs variations
  'adlfs': 'adlfs',
  'adl-fsspec': 'adlfs',
  
  // Zarr variations
  'zarr': 'zarr',
  'zarr-python': 'zarr',
  
  // Netcdf4 variations
  'netcdf': 'netcdf4',
  'netcdf-4': 'netcdf4',
  
  // Biopython variations
  'biopyton': 'biopython',
  'biopythn': 'biopython',
  
  // Astropy variations
  'astopy': 'astropy',
  'astropyy': 'astropy',
  
  // Sunpy variations
  'sunpy': 'sunpy',
  'sunppy': 'sunpy',
  
  // Rpy2 variations
  'rpy': 'rpy2',
  'rpy-2': 'rpy2',
  
  // Igraph variations
  'igraph': 'igraph',
  'igrph': 'igraph',
  
  // Pyquery variations
  'pyquery': 'pyquery',
  'pyquey': 'pyquery',
  
  // Mechanize variations
  'mechanize': 'mechanize',
  'mechaniz': 'mechanize',
  
  // Jsonschema variations
  'json-schema': 'jsonschema',
  'jsonschemaa': 'jsonschema',
  
  // PyYAML variations
  'pyyaml': 'pyyaml',
  'py-yaml': 'pyyaml',
  'yaml': 'pyyaml',
  
  // Toml variations
  'toml': 'toml',
  'tomli': 'tomli',
  
  // Configparser variations
  'config-parser': 'configparser',
  'configparserr': 'configparser',
  
  // Python-dotenv variations
  'python-dotenv': 'python-dotenv',
  'dotenv': 'python-dotenv',
  
  // Environs variations
  'environs': 'environs',
  'envrons': 'environs',
  
  // Dynaconf variations
  'dynacon': 'dynaconf',
  'dynaconff': 'dynaconf',
  
  // Python-decouple variations
  'python-decouple': 'python-decouple',
  'decouple': 'python-decouple',
  
  // Confuse variations
  'confuse': 'confuse',
  'confusd': 'confuse',
  
  // Structlog variations
  'structlog': 'structlog',
  'struct-log': 'structlog',
  
  // Loguru variations
  'loguru': 'loguru',
  'logru': 'loguru',
  
  // Sentry-sdk variations
  'sentry': 'sentry-sdk',
  'sentry-sdk': 'sentry-sdk',
  
  // Prometheus-client variations
  'prometheus': 'prometheus-client',
  'prometheus-client': 'prometheus-client',
  
  // Statsd variations
  'statsd': 'statsd',
  'stats-d': 'statsd',
  
  // Datadog variations
  'datadog': 'datadog',
  'datadog-api': 'datadog',
  
  // Six variations
  'sixx': 'six',
  'six-python': 'six',
  
  // Simplejson variations
  'simplejson': 'simplejson',
  'simple-json': 'simplejson',
  
  // Ujson variations
  'ujson': 'ujson',
  'u-json': 'ujson',
  
  // Ojson variations
  'orjson': 'orjson',
  'or-json': 'orjson',
  
  // Msgpack variations
  'msgpack': 'msgpack',
  'msg-pack': 'msgpack',
  
  // Protobuf variations
  'protobuf': 'protobuf',
  'proto-buf': 'protobuf',
  
  // Grpcio variations
  'grpc': 'grpcio',
  'grpc-io': 'grpcio',
  
  // Typing-extensions variations
  'typing-extensions': 'typing-extensions',
  
  // Mypy-extensions variations
  'mypy-extensions': 'mypy-extensions',
  'mypy-ext': 'mypy-extensions',
  
  // Pathlib variations
  'pathlib': 'pathlib',
  'path-lib': 'pathlib',
  
  // Pathspec variations
  'pathspec': 'pathspec',
  'path-spec': 'pathspec',
  
  // Pyinotify variations
  'pyinotify': 'pyinotify',
  'py-notify': 'pyinotify',
  
  // Charset-normalizer variations
  'charset-normalizer': 'charset-normalizer',
  
  // Defusedxml variations
  'defusedxml': 'defusedxml',
  'defused-xml': 'defusedxml',
  
  // Xlml variations
  'xmltodict': 'xmltodict',
  'xml-to-dict': 'xmltodict',
  
  // Feedparser variations
  'feedparser': 'feedparser',
  'feed-parser': 'feedparser',
  
  // Python-slugify variations
  'python-slugify': 'python-slugify',
  'slugify': 'python-slugify',
  
  // Python-magic variations
  'python-magic': 'python-magic',
  'magic': 'python-magic',
  
  // Filetype variations
  'filetype': 'filetype',
  'file-type': 'filetype',
  
  // Mimetypes variations
  'mimetypes': 'mimetypes',
  'mime-types': 'mimetypes',
  
  // Mimetools variations
  'mimetools': 'mimetools',
  'mime-tools': 'mimetools',
  
  // Hashlib variations
  'hashlib': 'hashlib',
  'hash-lib': 'hashlib',
  
  // Hmac variations
  'hmac': 'hmac',
  'hmac-python': 'hmac',
  
  // Secrets variations
  'secrets': 'secrets',
  'secrets-python': 'secrets',
  
  // Uuid variations
  'uuid': 'uuid',
  'uuid-python': 'uuid',
  
  // Shortuuid variations
  'shortuuid': 'shortuuid',
  'short-uuid': 'shortuuid',
  
  // Nanoid variations
  'nanoid': 'nanoid',
  'nano-id': 'nanoid',
  
  // Factory-boy variations
  'factory-boy': 'factory-boy',
  'factoryboy': 'factory-boy',
  
  // Retrying variations
  'retrying': 'retrying',
  'retry-ing': 'retrying',
  
  // Retry variations
  'retry': 'retry',
  'retry-python': 'retry',
  
  // Timeout-decorator variations
  'timeout-decorator': 'timeout-decorator',
  
  // Stopit variations
  'stopit': 'stopit',
  'stop-it': 'stopit',
  
  // Multiprocessing variations
  'multiprocessing': 'multiprocessing',
  'multi-processing': 'multiprocessing',
  
  // Loky variations
  'loky': 'loky',
  'loky-python': 'loky',
  
  // Pyrabbitmq variations
  'pyrabbitmq': 'pyrabbitmq',
  'py-rabbitmq': 'pyrabbitmq',
  
  // Mkdocs variations
  'mkdocs': 'mkdocs',
  'mk-docs': 'mkdocs',
  
  // Pdoc variations
  'pdoc': 'pdoc',
  'pdoc-python': 'pdoc',
  
  // Pdoc3 variations
  'pdoc3': 'pdoc3',
  'pdoc-3': 'pdoc3',
  
  // Sphinx-rtd-theme variations
  'sphinx-rtd-theme': 'sphinx-rtd-theme',
  'sphinx-rtd': 'sphinx-rtd-theme',
  
  // Twine variations
  'twine': 'twine',
  'twine-python': 'twine',
  
  // Build variations
  'build': 'build',
  'build-python': 'build',
  
  // Poetry variations
  'poetry': 'poetry',
  'poetry-python': 'poetry',
  
  // Pipenv variations
  'pipenv': 'pipenv',
  'pip-env': 'pipenv',
  
  // Hatch variations
  'hatch': 'hatch',
  'hatch-python': 'hatch',
  
  // Flit variations
  'flit': 'flit',
  'flit-python': 'flit',
  
  // Pdm variations
  'pdm': 'pdm',
  'pdm-python': 'pdm',
  
  // Jupyterlab variations
  'jupyterlab': 'jupyterlab',
  'jupyter-lab': 'jupyterlab',
  
  // Ipywidgets variations
  'ipywidgets': 'ipywidgets',
  'ipy-widgets': 'ipywidgets',
  
  // Notebook variations
  'notebook': 'notebook',
  'notebook-python': 'notebook',
  
  // Nbconvert variations
  'nbconvert': 'nbconvert',
  'nb-convert': 'nbconvert',
  
  // Nbformat variations
  'nbformat': 'nbformat',
  'nb-format': 'nbformat',
  
  // Colorama variations
  'colorama': 'colorama',
  'color-ama': 'colorama',
  
  // Termcolor variations
  'termcolor': 'termcolor',
  'term-color': 'termcolor',
  
  // Tabulate variations
  'tabulate': 'tabulate',
  'tabulat': 'tabulate',
  
  // Prettytable variations
  'prettytable': 'prettytable',
  'pretty-table': 'prettytable',
  
  // Pyparsing variations
  'pyparsing': 'pyparsing',
  'py-parsing': 'pyparsing',
  
  // Regex variations
  'regex': 'regex',
  'regex-python': 'regex',
  
  // Re2 variations
  're2': 're2',
  're2-python': 're2',
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix: number[][] = []

  // Initialize the matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  // Fill the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Calculate similarity score between two strings (0-1)
 * Higher score means more similar
 */
function calculateSimilarity(a: string, b: string): number {
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase())
  const maxLength = Math.max(a.length, b.length)
  if (maxLength === 0) return 1
  return 1 - distance / maxLength
}

/**
 * Find similar packages using fuzzy matching
 * Returns packages with similarity above the threshold
 */
export function findSimilarPackages(
  query: string,
  maxResults: number = 5,
  similarityThreshold: number = 0.6
): string[] {
  const normalizedQuery = query.toLowerCase().trim()
  
  // Check for exact alias match first
  if (PACKAGE_ALIASES[normalizedQuery]) {
    return [PACKAGE_ALIASES[normalizedQuery]]
  }

  // Calculate similarity scores for all packages
  const scores = POPULAR_PACKAGES.map(pkg => ({
    name: pkg,
    similarity: calculateSimilarity(normalizedQuery, pkg),
  }))

  // Sort by similarity (descending) and filter by threshold
  const matches = scores
    .filter(item => item.similarity >= similarityThreshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxResults)
    .map(item => item.name)

  return matches
}

/**
 * Get suggestions for a misspelled package name
 * Returns both exact aliases and fuzzy matches
 */
export function getPackageSuggestions(
  query: string,
  maxResults: number = 5
): string[] {
  const normalizedQuery = query.toLowerCase().trim()
  
  // Check for exact alias match
  if (PACKAGE_ALIASES[normalizedQuery]) {
    return [PACKAGE_ALIASES[normalizedQuery]]
  }

  // Get fuzzy matches with a lower threshold for suggestions
  const suggestions = findSimilarPackages(normalizedQuery, maxResults, 0.5)
  
  return suggestions
}

/**
 * Check if a package name is likely a typo
 * Returns true if the query doesn't match any package but has close matches
 */
export function isLikelyTypo(query: string): boolean {
  const normalizedQuery = query.toLowerCase().trim()
  
  // Check if it's an exact match
  if (POPULAR_PACKAGES.includes(normalizedQuery)) {
    return false
  }

  // Check if it's an alias
  if (PACKAGE_ALIASES[normalizedQuery]) {
    return false
  }

  // Check for close matches
  const suggestions = findSimilarPackages(normalizedQuery, 1, 0.7)
  return suggestions.length > 0
}

/**
 * Get the corrected package name if it exists as an alias
 */
export function getCorrectedPackageName(query: string): string | null {
  const normalizedQuery = query.toLowerCase().trim()
  return PACKAGE_ALIASES[normalizedQuery] || null
}
