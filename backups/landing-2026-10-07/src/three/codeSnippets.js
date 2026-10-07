/**
 * Code shown on the floating panels. Each line is a list of [text, tokenType]
 * segments so we can syntax-colour without shipping a highlighter.
 */
export const TOKEN_COLORS = {
  kw: '#ff8a68', // keywords
  fn: '#8fb1ff', // functions / methods
  str: '#6fe3b4', // strings
  var: '#ecebe7', // identifiers
  cm: '#6b6f78', // comments / punctuation-heavy
  num: '#f5c26b', // numbers
  tag: '#ffb09a', // JSX tags
  op: '#a1a3aa', // operators / punctuation
  ok: '#6fe3b4',
}

export const PANELS = [
  {
    file: 'routes/api.php',
    lines: [
      [['<?php', 'kw']],
      [],
      [['Route', 'var'], ['::', 'op'], ['prefix', 'fn'], ['(', 'op'], ["'v1'", 'str'], [')', 'op']],
      [['    ->', 'op'], ['group', 'fn'], ['(', 'op'], ['function', 'kw'], [' () {', 'op']],
      [['    Route', 'var'], ['::', 'op'], ['get', 'fn'], ['(', 'op'], ["'/projects'", 'str'], [');', 'op']],
      [['});', 'op']],
    ],
  },
  {
    file: 'ProjectController.php',
    lines: [
      [['public function ', 'kw'], ['index', 'fn'], ['(): ', 'op'], ['JsonResponse', 'var']],
      [['{', 'op']],
      [['    return ', 'kw'], ['ApiResponse', 'var'], ['::', 'op'], ['paginated', 'fn'], ['(', 'op']],
      [['        Project', 'var'], ['::', 'op'], ['published', 'fn'], ['()->', 'op'], ['paginate', 'fn'], ['(', 'op'], ['12', 'num'], [')', 'op']],
      [['    );', 'op']],
      [['}', 'op']],
    ],
  },
  {
    file: 'Portfolio.jsx',
    lines: [
      [['const ', 'kw'], ['[data, setData] ', 'var'], ['= ', 'op'], ['useState', 'fn'], ['([]);', 'op']],
      [],
      [['useEffect', 'fn'], ['(() => {', 'op']],
      [['  fetch', 'fn'], ['(', 'op'], ["'/api/projects'", 'str'], [')', 'op']],
      [['    .', 'op'], ['then', 'fn'], ['((res) => res.', 'op'], ['json', 'fn'], ['())', 'op']],
      [['}, []);', 'op']],
      [['return ', 'kw'], ['<Portfolio ', 'tag'], ['/>', 'tag'], [';', 'op']],
    ],
  },
  {
    file: 'query.sql',
    lines: [
      [['SELECT ', 'kw'], ['title, slug, category', 'var']],
      [['FROM ', 'kw'], ['projects', 'fn']],
      [['WHERE ', 'kw'], ['status ', 'var'], ['= ', 'op'], ["'published'", 'str']],
      [['ORDER BY ', 'kw'], ['sort_order', 'var'], [';', 'op']],
    ],
  },
  {
    file: 'terminal',
    lines: [
      [['$ ', 'cm'], ['php artisan migrate --seed', 'var']],
      [['  ✓ ', 'ok'], ['projects ........... ', 'cm'], ['DONE', 'ok']],
      [['$ ', 'cm'], ['npm run build', 'var']],
      [['  ✓ ', 'ok'], ['built in ', 'cm'], ['2.1s', 'num']],
    ],
  },
  {
    file: 'server.js',
    lines: [
      [['const ', 'kw'], ['app ', 'var'], ['= ', 'op'], ['express', 'fn'], ['();', 'op']],
      [['app', 'var'], ['.', 'op'], ['use', 'fn'], ['(', 'op'], ['express', 'var'], ['.', 'op'], ['json', 'fn'], ['());', 'op']],
    ],
  },
  {
    file: 'main.dart',
    lines: [
      [['Widget ', 'var'], ['build', 'fn'], ['(context) {', 'op']],
      [['  return ', 'kw'], ['ProjectList', 'fn'], ['();', 'op']],
      [['}', 'op']],
    ],
  },
]

/** Small floating labels. `dot` is the accent colour of the pill's indicator. */
export const CHIPS = [
  { label: 'PHP', dot: '#8f93d6' },
  { label: 'Laravel', dot: '#ff6a45' },
  { label: 'React', dot: '#61dafb' },
  { label: 'REST API', dot: '#6fe3b4' },
  { label: 'MySQL', dot: '#5b8fc7' },
  { label: 'JavaScript', dot: '#f5c26b' },
  { label: 'Git', dot: '#f05033' },
  { label: 'Flutter', dot: '#55a8f0' },
  { label: 'HTML · CSS', dot: '#ff8a68' },
  { label: 'GitHub', dot: '#ecebe7' },
]
