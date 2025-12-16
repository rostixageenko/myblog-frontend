-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Окт 19 2025 г., 17:06
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `api_test`
--

-- --------------------------------------------------------

--
-- Структура таблицы `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `title` varchar(256) DEFAULT NULL,
  `body` mediumtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `posts`
--

INSERT INTO `posts` (`id`, `title`, `body`) VALUES
(1, 'Тишина — это новый люкс', 'Откройте для себя целительную силу тишины и её влияние на снижение стресса и улучшение концентрации. Практические советы, как внести минуты покоя в свой день.'),
(2, 'Забудьте о многозадачности: сила одного фокуса', 'Почему многозадачность — это миф и как она крадёт вашу продуктивность. Простой метод, который поможет сосредоточиться на одной задаче и выполнять её качественнее и быстрее.'),
(3, 'Почему ужин при свечах — это не просто романтика', 'Как приглушённый свет вечером влияет на выработку мелатонина и качество сна. Простой ритуал для легкого засыпания и полноценного отдыха.'),
(4, 'Что такое осознанные покупки и как они спасают бюджет', 'Как перестать совершать импульсные покупки и начать тратить деньги с пользой. Всего один вопрос, который поможет сохранить бюджет и избавиться от хлама.'),
(5, '', '');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
