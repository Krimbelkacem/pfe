CREATE TABLE User (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255),
  picture VARCHAR(255),
  isAdmin BOOLEAN,
  verified BOOLEAN,
  archived BOOLEAN,
  verificationToken VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  archive BOOLEAN,
  FOREIGN KEY (archive) REFERENCES User(id)
);

CREATE TABLE Item (
  id INT PRIMARY KEY AUTO_INCREMENT,
  image VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE Resto (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  address VARCHAR(255),
  owner_id INT,
  menu_id INT,
  description TEXT,
  phone VARCHAR(255),
  latitude DECIMAL(9, 6) NOT NULL,
  longitude DECIMAL(9, 6) NOT NULL,
  price_average DECIMAL(10, 2) DEFAULT 0.0,
  FOREIGN KEY (owner_id) REFERENCES User(id),
  FOREIGN KEY (menu_id) REFERENCES Menu(id)
);

CREATE TABLE Menu (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255)
);

CREATE TABLE Category (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255)
);

CREATE TABLE Cuisine (
  id INT PRIMARY KEY AUTO_INCREMENT,
  image VARCHAR(255),
  name VARCHAR(255)
);

CREATE TABLE OpeningHour (
  id INT PRIMARY KEY AUTO_INCREMENT,
  day VARCHAR(255),
  startTime TIME DEFAULT '11:00:00',
  endTime TIME DEFAULT '23:59:59'
);

CREATE TABLE Comment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  comment TEXT,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(id)
);

CREATE TABLE Reservation (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE,
  time VARCHAR(255),
  guests INT,
  user_id INT,
  resto_id INT,
  state VARCHAR(255) DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES User(id),
  FOREIGN KEY (resto_id) REFERENCES Resto(id)
);

CREATE TABLE Resto_User (
  resto_id INT,
  user_id INT,
  FOREIGN KEY (resto_id) REFERENCES Resto(id),
  FOREIGN KEY (user_id) REFERENCES User(id)
);

CREATE TABLE Resto_Reserve (
  resto_id INT,
  reserve_id INT,
  FOREIGN KEY (resto_id) REFERENCES Resto(id),
  FOREIGN KEY (reserve_id) REFERENCES Reservation(id)
);

CREATE TABLE User_Reserve (
  user_id INT,
  reserve_id INT,
  FOREIGN KEY (user_id) REFERENCES User(id),
  FOREIGN KEY (reserve_id) REFERENCES Reservation(id)
);

CREATE TABLE Category_Item (
  category_id INT,
  item_id INT,
  FOREIGN KEY (category_id) REFERENCES Category(id),
  FOREIGN KEY (item_id) REFERENCES Item(id)
);

CREATE TABLE Resto_Cuisine (
  resto_id INT,
  cuisine_id INT,
  FOREIGN KEY (resto_id) REFERENCES Resto(id),
  FOREIGN KEY (cuisine_id) REFERENCES Cuisine(id)
);

CREATE TABLE Resto_OpeningHour (
  resto_id INT,
  openingHour_id INT,
  FOREIGN KEY (resto_id) REFERENCES Resto(id),
  FOREIGN KEY (openingHour_id) REFERENCES OpeningHour(id)
);

CREATE TABLE Comment_User (
  comment_id INT,
  user_id INT,
  FOREIGN KEY (comment_id) REFERENCES Comment(id),
  FOREIGN KEY (user_id) REFERENCES User(id)
);
