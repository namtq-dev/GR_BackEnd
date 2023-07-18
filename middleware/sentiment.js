const { WordTokenizer, SentimentAnalyzer, PorterStemmer } = require('natural');
const sw = require('stopword');

module.exports = function (req, res, next) {
  try {
    const { comment } = req.body;

    // Preprocess:
    // 1. Convert common contractions to standard lexicon
    // 2. Convert text to lowercase
    // 3. Remove special characters
    const uniformComment = expandContractions(comment)
      .toLowerCase()
      .replace(/[^a-zA-Z\s]+/g, '');

    // Tokenization
    const tokenizer = new WordTokenizer();
    const tokens = tokenizer.tokenize(uniformComment);

    // Remove stop words
    const filteredComment = sw.removeStopwords(tokens);

    // Comment sentiment
    const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
    const analysis = analyzer.getSentiment(filteredComment);

    req.body.analysis = analysis;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Conversion of common contractions to standard lexicon
const contractions = {
  "a'ight": 'alright',
  "ain't": 'am not',
  "amn't": 'am not',
  "'n'": 'and',
  "aren't": 'are not',
  "'bout": 'about',
  "can't": 'cannot',
  "cap'n": 'captain',
  "'cause": 'because',
  "'cept": 'except',
  "could've": 'could have',
  "couldn't": 'could not',
  "couldn't've": 'could not have',
  dammit: 'damn it',
  darn: 'damn it',
  "daren't": 'dare not',
  "didn't": 'did not',
  "doesn't": 'does not',
  "don't": 'do not',
  dunno: 'do not know',
  "d'ye": 'do you',
  "d'ya": 'do you',
  "e'en": 'even',
  "e'er": 'ever',
  "'em": 'them',
  "everybody's": 'everybody is',
  "everyone's": 'everyone is',
  finna: 'fixing to',
  "'gainst": 'against',
  "g'day": 'good day',
  gimme: 'give me',
  "giv'n": 'given',
  "gi'z": 'give us',
  gonna: 'going to',
  gotta: 'got to',
  "hadn't": 'had not',
  "had've": 'had have',
  "hasn't": 'has not',
  "haven't": 'have not',
  "he'd": 'he had',
  "he'll": 'he shall',
  helluva: 'hell of a',
  "he's": 'he has',
  "here's": 'here is',
  "how'd": 'how did',
  howdy: 'how do you do',
  "how'll": 'how will',
  "how're": 'how are',
  "how's": 'how has',
  "i'd": 'I had',
  "i'd've": 'I would have',
  "i'd'nt": 'I would not',
  "i'd'nt've": 'I would not have',
  "i'll": 'I shall',
  "i'm": 'I am',
  imma: 'I am about to',
  "i'm'o": 'I am going to',
  innit: 'is not it',
  ion: 'I do not',
  "i've": 'I have',
  "isn't": 'is not',
  "it'd": 'it would',
  "it'll": 'it shall',
  "it's": 'it is',
  idunno: 'I do not know',
  kinda: 'kind of',
  "let's": 'let us',
  "loven't": 'love not',
  "ma'am": 'madam',
  "mayn't": 'may not',
  "may've": 'may have',
  methinks: 'I think',
  "mightn't": 'might not',
  "might've": 'might have',
  "mustn't": 'must not',
  "mustn't've": 'must not have',
  "must've": 'must have',
  "'neath": 'beneath',
  "needn't": 'need not',
  nal: 'and all',
  "ne'er": 'never',
  "o'clock": 'of the clock',
  "o'er": 'over',
  "ol'": 'old',
  "ought've": 'ought have',
  "oughtn't": 'ought not',
  "oughtn't've": 'ought not have',
  "'round": 'around',
  "'s": 'is',
  "shalln't": 'shall not',
  "shan't": 'shall not',
  "she'd": 'she had',
  "she'll": 'she shall',
  "she's": 'she has',
  "should've": 'should have',
  "shouldn't": 'should not',
  "shouldn't've": 'should not have',
  "somebody's": 'somebody has',
  "someone's": 'someone has',
  "something's": 'something has',
  "so're": 'so are',
  "so's": 'so is',
  "so've": 'so have',
  "that'll": 'that shall',
  "that're": 'that are',
  "that's": 'that has',
  "that'd": 'that would',
  "there'd": 'there had',
  "there'll": 'there shall',
  "there're": 'there are',
  "there's": 'there has',
  "these're": 'these are',
  "these've": 'these have',
  "they'd": 'they had',
  "they'll": 'they shall',
  "they're": 'they are',
  "they've": 'they have',
  "this's": 'this has',
  "those're": 'those are',
  "those've": 'those have',
  "'thout": 'without',
  "'til": 'until',
  "'tis": 'it is',
  "to've": 'to have',
  "'twas": 'it was',
  "'tween": 'between',
  "'twere": 'it were',
  "w'all": 'we all',
  "w'at": 'we at',
  wanna: 'want to',
  "wasn't": 'was not',
  "we'd": 'we had',
  "we'd've": 'we would have',
  "we'll": 'we shall',
  "we're": 'we are',
  "we've": 'we have',
  "weren't": 'were not',
  whatcha: 'what are you',
  "what'd": 'what did',
  "what'll": 'what shall',
  "what're": 'what are',
  "what's": 'what has',
  "what've": 'what have',
  "when's": 'when has',
  "where'd": 'where did',
  "where'll": 'where shall',
  "where're": 'where are',
  "where's": 'where has',
  "where've": 'where have',
  "which'd": 'which had',
  "which'll": 'which shall',
  "which're": 'which are',
  "which's": 'which has',
  "which've": 'which have',
  "who'd": 'who would',
  "who'd've": 'who would have',
  "who'll": 'who shall',
  "who're": 'who are',
  "who's": 'who has',
  "who've": 'who have',
  "why'd": 'why did',
  "why're": 'why are',
  "why's": 'why has',
  "willn't": 'will not',
  "won't": 'will not',
  "would've": 'would have',
  "wouldn't": 'would not',
  "wouldn't've": 'would not have',
  "y'ain't": 'you are not',
  "y'all": 'you all',
  "y'all'd've": 'you all would have',
  "y'all'd'n't've": 'you all would not have',
  "y'all're": 'you all are',
  "y'all'ren't": 'you all are not',
  "y'at": 'you at',
  "yes'm": "yes ma'am",
  "y'know": 'you know',
  yessir: 'yes sir',
  "you'd": 'you had',
  "you'll": 'you shall',
  "you're": 'you are',
  "you've": 'you have',
  "when'd": 'when did',
};

const expandContractions = (text) => {
  const words = text.split(' ');

  const expandedWords = words.map((word) => {
    const normalizedWord = word.toLowerCase(); // Normalize word to lowercase for case-insensitive matching
    if (contractions.hasOwnProperty(normalizedWord)) {
      return contractions[normalizedWord];
    }
    return word;
  });

  return expandedWords.join(' ');
};
