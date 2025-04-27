const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5500;

// Создаем папку для загрузок если её нет
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder)
}

// Настройки Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // чтобы избежать конфликтов имен
  }
});
const upload = multer({ storage: storage });

// Раздаём статику
app.use('/uploads', express.static(uploadFolder));
app.use(express.static(__dirname));

// Загрузка файла
app.post('/upload', upload.single('file'), (req, res) => {
  res.redirect('/files.html');
});

// Список файлов
app.get('/files', (req, res) => {
  const folderPath = path.join(__dirname, 'uploads');

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).send('Ошибка чтения папки');
    }
    res.json(files);
  });
});


// Удаление файла
app.delete('/delete', (req, res) => {
  const file = req.query.file;
  if (!file) {
    return res.status(400).send('Файл не указан');
  }
  const filePath = path.join(uploadFolder, file);
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).send('Ошибка удаления');
    }
    res.sendStatus(200);
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер работает на http://localhost:${PORT}`);
});
