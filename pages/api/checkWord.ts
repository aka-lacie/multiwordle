import * as fs from 'fs';
import * as path from 'path';

const checkWord = async (req, res) => {
  const { word } = req.query;
  console.log(word);
  const wordsFilePath1 = path.resolve(process.cwd(), 'assets', 'wordle-Ta.txt');
  const words1 = fs.readFileSync(wordsFilePath1, 'utf-8');
  const wordsFilePath2 = path.resolve(process.cwd(), 'assets', 'words.txt');
  const words2 = fs.readFileSync(wordsFilePath2, 'utf-8');
  const wordArr1 = words1.split("\n");
  const wordArr2 = words2.split("\n");
  const wordSet = new Set(wordArr1);
  wordArr2.forEach(wordSet.add, wordSet);
  res.status(200).json({ word: word, isWord: wordSet.has(word) });
};

export default checkWord;