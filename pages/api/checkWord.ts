import * as fs from 'fs';
import * as path from 'path';

const checkWord = async (req, res) => {
  const { word } = req.query;
  console.log(word);
  const wordsFilePath = path.resolve(process.cwd(), 'assets', 'words.txt');
  const words = fs.readFileSync(wordsFilePath, 'utf-8');
  const wordArr = words.split("\n");
  const wordSet = new Set(wordArr);
  res.status(200).json({ word: word, isWord: wordSet.has(word) });
};

export default checkWord;