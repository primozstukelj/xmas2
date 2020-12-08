var express = require('express');
var router = express.Router();

const FLAG = process.env.FLAG || 'xmas{S@nTa_Loves_Ex73rnal_Ent1t13$}';


/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

/* POST home page. */
router.post('/', (req, res, next) => {
  console.log('POST');

  res.send('FLAG')
});

router.post('/check', (req, res) => {
  if (req.session.solved) {
    // console.log(`[CHECK] correct code was already submitet (solved: ${req.session.solved})`);
    res.render('index', { solved: req.session.solved });
  } else if (!req.session.code) {
    // console.log(`[CHECK] code value was not initalized (code: ${req.session.code})`);
    // Generate new passphrase.
    init(req, res);
  } else {
    if (!'code' in req.body) {
      // Code value was not submitet in request body
      // Generate new passphrase.
      // console.log(`[CHECK] code parameter was bot present in req body (body: ${req.body})`);
      init(req, res);
    } else {
      // Check if submitet passphrase/code is correct.
      // If it's correct then set session variable solved to True.
      // Otherwise generate new passphrase/code.
      const code = String(req.body.code).toUpperCase();
      // Check if there match.
      if (req.session.code.length === code.length && req.session.code === code) {
        // console.log(`[CHECK] ${req.session.code} == ${code}`);
        req.session.code = '';
        req.session.solved = true;
        res.render('index', { solved: req.session.solved });
      } else {
        // console.log(`[CHECK] ${req.session.code} != ${code}`);
        // Generate new passphrase.
        init(req, res, true);
      }
    }
  }
});

router.post('/submit', (req, res) => {
  if (req.session.solved) {
    if (!'value' in req.body) {
      res.render('index', { solved: req.session.solved });
    }
    const flag = req.body.value;
    const start = performance.now();

    if (FLAG.includes(flag)) {
      sleep.usleep(10);
    }

    const end = performance.now();
    // const duration = end - start;
    const info = JSON.stringify({ start, end })

    if (flag === FLAG) {
      // console.log(`[SUBMIT] Send flag`) // debug
      res.render('index', { solved: req.session.solved, flag: FLAG });
    } else if ('debug' in req.body) {
      // console.log(`[SUBMIT] Debug mode`) // debug
      res.render('index', { solved: req.session.solved, info })
    } else {
      // console.log(`[SUBMIT] Wrong flag`) // debug
      res.render('index', { solved: req.session.solved })
    }
  } else {
    init(req, res);
  }
});

module.exports = router;
