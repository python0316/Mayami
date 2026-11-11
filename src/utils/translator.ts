/**
 * Intelligent Multi-Language Translation Utility for Mayami Marketplace
 * Automatically translates Uzbek product names, descriptions, categories, and colors
 * into Russian and English, ensuring a 100% localized multilingual e-commerce experience.
 */

import { Language, Product, ColorOption } from '../types';

// Multi-word phrase mapping for high accuracy
const PHRASE_DICTIONARY_RU: [RegExp, string][] = [
  // Compound terms
  [/\berkaklar\s+kiyimi\b/gi, 'мужская одежда'],
  [/\bayollar\s+kiyimi\b/gi, 'женская одежда'],
  [/\bbolalar\s+kiyimi\b/gi, 'детская одежда'],
  [/\boyoq\s+kiyim(i)?\b/gi, 'обувь'],
  [/\bpoyabzal(i)?\b/gi, 'обувь'],
  [/\bsport\s+kiyimi\b/gi, 'спортивная одежда'],
  [/\bsport\s+kostyum(i)?\b/gi, 'спортивный костюм'],
  [/\bich\s+kiyim(i)?\b/gi, 'нижнее белье'],
  [/\bbosh\s+kiyim(i)?\b/gi, 'головной убор'],
  [/\bquyosh\s+ko'zoynag(i)?\b/gi, 'солнцезащитные очки'],
  [/\bqo'l\s+soat(i)?\b/gi, 'наручные часы'],
  [/\bsmart\s+soat\b/gi, 'смарт-часы'],
  [/\boq\s+mushk\b/gi, 'белый мускус'],
  [/\btabiiy\s+charm\b/gi, 'натуральная кожа'],
  [/\bhaqiqiy\s+charm\b/gi, 'натуральная кожа'],
  [/\btoza\s+paxta\b/gi, 'чистый хлопок'],
  [/\btabiiy\s+paxta\b/gi, 'натуральный хлопок'],
  [/\bortopedik\s+taglik\b/gi, 'ортопедическая стелька'],
  [/\bsuv\s+o'tkazmaydigan\b/gi, 'водонепроницаемый'],
  [/\bnafas\s+oladigan\b/gi, 'дышащий'],
  [/\bsirpanmaydigan\b/gi, 'нескользящий'],
  [/\byuqori\s+sifatli\b/gi, 'высококачественный'],
  [/\bkundalik\s+kiyish\s+uchun\b/gi, 'для повседневной носки'],
  [/\bsovg'a\s+uchun\b/gi, 'для подарка'],
  [/\byangi\s+to'plam\b/gi, 'новая коллекция'],
  [/\bto'q\s+qizil\b/gi, 'бордовый'],
  [/\bto'q\s+ko'k\b/gi, 'темно-синий'],
  [/\boch\s+ko'k\b/gi, 'голубой'],
  [/\boch\s+jigarrang\b/gi, 'бежевый'],
  [/\boq\s+va\s+qora\b/gi, 'черно-белый'],
  [/\bchust\s+do'ppisi\b/gi, 'чустская тюбетейка'],
  [/\bjuma\s+namozi\b/gi, 'пятничная молитва'],
  [/\barab\s+atiri\b/gi, 'арабский парфюм'],
  [/\bspirtsiz\s+atir\b/gi, 'бесспиртовой парфюм'],
  [/\bbaxmal\s+joynamoz\b/gi, 'бархатный молитвенный коврик'],
  [/\belektron\s+tasbeh\b/gi, 'электронные четки'],
  [/\bklassik\s+kostyum\b/gi, 'классический костюм'],
  [/\bcharm\s+kurtka\b/gi, 'кожаная куртка'],
  [/\bjinsi\s+shim\b/gi, 'джинсовые брюки'],
  [/\bbatafsil\s+ma'lumot\b/gi, 'подробная информация'],
  [/\brasmiy\s+kafolat\b/gi, 'официальная гарантия'],
  [/\bkafolat\s+muddati\b/gi, 'гарантийный срок'],
  [/\bbepul\s+yetkazib\s+berish\b/gi, 'бесплатная доставка'],
  [/\btezkor\s+yetkazib\s+berish\b/gi, 'быстрая доставка'],
  [/\bo'lchamlari\s+mavjud\b/gi, 'размеры в наличии'],
  [/\bhar\s+kuni\s+kiyish\s+uchun\b/gi, 'для ежедневной носки'],
  [/\bjuda\s+qulay\s+va\s+chidamli\b/gi, 'очень удобный и долговечный'],
  [/\bsifatli\s+va\s+chidamli\b/gi, 'качественный и прочный'],
  [/\bzamonaviy\s+dizayn\b/gi, 'современный дизайн'],
  [/\basl\s+nusxa\b/gi, 'оригинальный товар'],
  [/\boriginal\s+mahsulot\b/gi, 'оригинальный продукт'],
  [/\bkiyish\s+uchun\s+qulay\b/gi, 'удобно носить'],
  [/\btanaga\s+yoqimli\b/gi, 'приятный к телу'],
  [/\brangi\s+o'chmaydi\b/gi, 'цвета не выцветают'],
  [/\bcho'zilmaydi\b/gi, 'не растягивается'],
  [/\bmatodan\s+tayyorlangan\b/gi, 'изготовлен из ткани'],
  [/\btavsiya\s+etiladi\b/gi, 'рекомендуется'],
  [/\beng\s+yaxshi\s+tanlov\b/gi, 'лучший выбор'],
  [/\bxarid\s+uchun\b/gi, 'для покупки'],
  [/\b100%\s+toza\s+paxta\b/gi, '100% чистый хлопок'],
  [/\b100%\s+tabiiy\s+charm\b/gi, '100% натуральная кожа'],
  [/\b100%\s+tabiiy\s+ipak\b/gi, '100% натуральный шелк'],
  [/\btoza\s+paxtadan\s+tayyorlangan\b/gi, 'изготовлен из чистого хлопка'],
  [/\btabiiy\s+charmdan\s+tayyorlangan\b/gi, 'изготовлен из натуральной кожи'],
  [/\bpaxtadan\s+tayyorlangan\b/gi, 'изготовлен из хлопка'],
  [/\bkiyish\s+uchun\s+juda\s+qulay\b/gi, 'очень удобный для носки'],
  [/\bkiyishga\s+qulay\b/gi, 'удобно носить'],
  [/\branglari\s+o'chmaydi\b/gi, 'цвета не выцветают'],
  [/\byuvganda\s+rangi\s+o'chmaydi\b/gi, 'при стирке цвета не линяют'],
  [/\bcho'zilmaydi\s+va\s+yirtilmaydi\b/gi, 'не растягивается и не рвется'],
  [/\bbarcha\s+o'lchamlari\s+mavjud\b/gi, 'все размеры в наличии'],
  [/\bbarcha\s+o'lchamlar\s+mavjud\b/gi, 'все размеры в наличии'],
  [/\bhar\s+kuni\s+kiyish\s+uchun\s+mos\b/gi, 'подходит для ежедневной носки'],
  [/\beng\s+yaxshi\s+narx\b/gi, 'лучшая цена'],
  [/\bhamyonbop\s+narx(da)?\b/gi, 'по доступной цене'],
  [/\byuqori\s+sifat\b/gi, 'высокое качество'],
  [/\ba'lo\s+darajada\b/gi, 'на высшем уровне'],
  [/\bo'zbekiston\s+bo'ylab\s+yetkazib\s+berish\b/gi, 'доставка по всему Узбекистану'],
  [/\btez\s+va\s+bepul\s+yetkazib\s+berish\b/gi, 'быстрая и бесплатная доставка']
];

const PHRASE_DICTIONARY_EN: [RegExp, string][] = [
  [/\berkaklar\s+kiyimi\b/gi, "men's clothing"],
  [/\bayollar\s+kiyimi\b/gi, "women's clothing"],
  [/\bbolalar\s+kiyimi\b/gi, "kids' clothing"],
  [/\boyoq\s+kiyim(i)?\b/gi, 'shoes'],
  [/\bpoyabzal(i)?\b/gi, 'footwear'],
  [/\bsport\s+kiyimi\b/gi, 'sportswear'],
  [/\bsport\s+kostyum(i)?\b/gi, 'tracksuit'],
  [/\bich\s+kiyim(i)?\b/gi, 'underwear'],
  [/\bbosh\s+kiyim(i)?\b/gi, 'headwear'],
  [/\bquyosh\s+ko'zoynag(i)?\b/gi, 'sunglasses'],
  [/\bqo'l\s+soat(i)?\b/gi, 'wristwatch'],
  [/\bsmart\s+soat\b/gi, 'smart watch'],
  [/\boq\s+mushk\b/gi, 'white musk'],
  [/\btabiiy\s+charm\b/gi, 'genuine leather'],
  [/\bhaqiqiy\s+charm\b/gi, 'genuine leather'],
  [/\btoza\s+paxta\b/gi, 'pure cotton'],
  [/\btabiiy\s+paxta\b/gi, 'natural cotton'],
  [/\bortopedik\s+taglik\b/gi, 'orthopedic insole'],
  [/\bsuv\s+o'tkazmaydigan\b/gi, 'waterproof'],
  [/\bnafas\s+oladigan\b/gi, 'breathable'],
  [/\bsirpanmaydigan\b/gi, 'non-slip'],
  [/\byuqori\s+sifatli\b/gi, 'high quality'],
  [/\bkundalik\s+kiyish\s+uchun\b/gi, 'for daily wear'],
  [/\bsovg'a\s+uchun\b/gi, 'for a gift'],
  [/\byangi\s+to'plam\b/gi, 'new collection'],
  [/\bto'q\s+qizil\b/gi, 'burgundy'],
  [/\bto'q\s+ko'k\b/gi, 'navy blue'],
  [/\boch\s+ko'k\b/gi, 'light blue'],
  [/\boch\s+jigarrang\b/gi, 'beige'],
  [/\boq\s+va\s+qora\b/gi, 'black and white'],
  [/\bchust\s+do'ppisi\b/gi, 'Chust traditional skullcap'],
  [/\bjuma\s+namozi\b/gi, 'Friday prayer'],
  [/\barab\s+atiri\b/gi, 'Arabian perfume oil'],
  [/\bspirtsiz\s+atir\b/gi, 'alcohol-free perfume'],
  [/\bbaxmal\s+joynamoz\b/gi, 'velvet prayer mat'],
  [/\belektron\s+tasbeh\b/gi, 'digital tasbih counter'],
  [/\bklassik\s+kostyum\b/gi, 'classic suit'],
  [/\bcharm\s+kurtka\b/gi, 'leather jacket'],
  [/\bjinsi\s+shim\b/gi, 'jeans trousers'],
  [/\bbatafsil\s+ma'lumot\b/gi, 'detailed information'],
  [/\brasmiy\s+kafolat\b/gi, 'official warranty'],
  [/\bkafolat\s+muddati\b/gi, 'warranty period'],
  [/\bbepul\s+yetkazib\s+berish\b/gi, 'free delivery'],
  [/\btezkor\s+yetkazib\s+berish\b/gi, 'fast delivery'],
  [/\bo'lchamlari\s+mavjud\b/gi, 'sizes in stock'],
  [/\bhar\s+kuni\s+kiyish\s+uchun\b/gi, 'for daily wear'],
  [/\bjuda\s+qulay\s+va\s+chidamli\b/gi, 'very comfortable and durable'],
  [/\bsifatli\s+va\s+chidamli\b/gi, 'high quality and durable'],
  [/\bzamonaviy\s+dizayn\b/gi, 'modern design'],
  [/\basl\s+nusxa\b/gi, 'original product'],
  [/\boriginal\s+mahsulot\b/gi, 'original product'],
  [/\bkiyish\s+uchun\s+qulay\b/gi, 'comfortable to wear'],
  [/\btanaga\s+yoqimli\b/gi, 'pleasant to touch'],
  [/\brangi\s+o'chmaydi\b/gi, 'colors do not fade'],
  [/\bcho'zilmaydi\b/gi, 'does not stretch'],
  [/\bmatodan\s+tayyorlangan\b/gi, 'made of fabric'],
  [/\btavsiya\s+etiladi\b/gi, 'recommended'],
  [/\beng\s+yaxshi\s+tanlov\b/gi, 'best choice'],
  [/\bxarid\s+uchun\b/gi, 'for purchase'],
  [/\b100%\s+toza\s+paxta\b/gi, '100% pure cotton'],
  [/\b100%\s+tabiiy\s+charm\b/gi, '100% genuine leather'],
  [/\b100%\s+tabiiy\s+ipak\b/gi, '100% natural silk'],
  [/\btoza\s+paxtadan\s+tayyorlangan\b/gi, 'made of pure cotton'],
  [/\btabiiy\s+charmdan\s+tayyorlangan\b/gi, 'made of genuine leather'],
  [/\bpaxtadan\s+tayyorlangan\b/gi, 'made of cotton'],
  [/\bkiyish\s+uchun\s+juda\s+qulay\b/gi, 'very comfortable to wear'],
  [/\bkiyishga\s+qulay\b/gi, 'comfortable to wear'],
  [/\branglari\s+o'chmaydi\b/gi, 'colors do not fade'],
  [/\byuvganda\s+rangi\s+o'chmaydi\b/gi, 'colors do not fade when washed'],
  [/\bcho'zilmaydi\s+va\s+yirtilmaydi\b/gi, 'does not stretch or tear'],
  [/\bbarcha\s+o'lchamlari\s+mavjud\b/gi, 'all sizes in stock'],
  [/\bbarcha\s+o'lchamlar\s+mavjud\b/gi, 'all sizes in stock'],
  [/\bhar\s+kuni\s+kiyish\s+uchun\s+mos\b/gi, 'suitable for daily wear'],
  [/\beng\s+yaxshi\s+narx\b/gi, 'best price'],
  [/\bhamyonbop\s+narx(da)?\b/gi, 'at an affordable price'],
  [/\byuqori\s+sifat\b/gi, 'high quality'],
  [/\ba'lo\s+darajada\b/gi, 'top quality'],
  [/\bo'zbekiston\s+bo'ylab\s+yetkazib\s+berish\b/gi, 'delivery across Uzbekistan'],
  [/\btez\s+va\s+bepul\s+yetkazib\s+berish\b/gi, 'fast and free delivery']
];

// Single word mappings
const WORD_MAP_RU: Record<string, string> = {
  // Genders
  'erkaklar': 'мужской',
  'erkak': 'мужской',
  'ayollar': 'женский',
  'ayol': 'женский',
  'bolalar': 'детский',
  'bola': 'детский',
  "o'g'il": 'для мальчиков',
  'qiz': 'для девочек',
  'yoshlar': 'молодежный',
  'uniseks': 'унисекс',
  'unisex': 'унисекс',

  // Clothing
  'kiyim': 'одежда',
  'kiyimi': 'одежда',
  'kostyum': 'костюм',
  'kostyumi': 'костюм',
  'shim': 'брюки',
  'shimi': 'брюки',
  'jinsi': 'джинсы',
  "ko'ylak": 'рубашка',
  "ko'ylagi": 'рубашка',
  'futbolka': 'футболка',
  'futbolkasi': 'футболка',
  'polo': 'поло',
  'kurtka': 'куртка',
  'kurtkasi': 'куртка',
  'palto': 'пальто',
  'plash': 'плащ',
  'sviter': 'свитер',
  'sviteri': 'свитер',
  'xudi': 'худи',
  'tolstovka': 'толстовка',
  'jempir': 'джемпер',
  'kardigan': 'кардиган',
  'nimcha': 'жилет',
  'jilet': 'жилет',
  'yubka': 'юбка',
  'yubkasi': 'юбка',
  'shortik': 'шорты',
  'shorti': 'шорты',
  'paypoq': 'носки',
  'paypog\'i': 'носки',
  'pijama': 'пижама',
  'xalat': 'халат',
  "do'ppi": 'тюбетейка',
  "do'ppisi": 'тюбетейка',
  'joynamoz': 'молитвенный коврик',
  'joynamozi': 'молитвенный коврик',
  'tasbeh': 'четки',
  'tasbehi': 'четки',
  'hijob': 'хиджаб',
  "ro'mol": 'платок',
  'qalpoq': 'шапка',
  'shapka': 'шапка',
  'kepka': 'кепка',
  'sharf': 'шарф',
  "qo'lqop": 'перчатки',
  'kamar': 'ремень',

  // Shoes
  'krossovka': 'кроссовки',
  'krossovkasi': 'кроссовки',
  'keda': 'кеды',
  'kedasi': 'кеды',
  'tufli': 'туфли',
  'tuflisi': 'туфли',
  'etik': 'сапоги',
  'etigi': 'сапоги',
  'mokasina': 'мокасины',
  'slipon': 'слипоны',
  'sandal': 'сандалии',
  'sandali': 'сандалии',
  'shippak': 'шлепанцы',
  'tapochka': 'тапочки',
  'botinka': 'ботинки',

  // Accessories & Items
  'sumka': 'сумка',
  'sumkasi': 'сумка',
  'ryukzak': 'рюкзак',
  'ryukzaki': 'рюкзак',
  'hamyon': 'кошелек',
  'soat': 'часы',
  'atir': 'парфюм',
  'atiri': 'парфюм',
  'mushk': 'мускус',
  'krem': 'крем',
  'kremi': 'крем',
  'shampun': 'шампунь',
  'sovun': 'мыло',
  'telefon': 'смартфон',
  'smartfon': 'смартфон',
  'noutbuk': 'ноутбук',
  'planshet': 'планшет',
  'quloqchin': 'наушники',
  'naushnik': 'наушники',
  'zaryadka': 'зарядное устройство',
  'powerbank': 'повербанк',
  'chexol': 'чехол',
  'kolonka': 'колонка',
  'chiroq': 'лампа',
  'lampa': 'лампа',
  'fen': 'фен',
  'dazmol': 'утюг',
  'changyutgich': 'пылесос',
  'choynak': 'чайник',
  'termos': 'термос',
  'yostiq': 'подушка',
  'adyol': 'одеяло',
  'choyshab': 'постельное белье',
  'sochiq': 'полотенце',

  // Adjectives & Qualities
  'klassik': 'классический',
  'zamonaviy': 'современный',
  'sportiv': 'спортивный',
  'sport': 'спортивный',
  'kundalik': 'повседневный',
  'yozgi': 'летний',
  'qishki': 'зимний',
  'bahorgi': 'весенний',
  'kuzgi': 'осенний',
  'issiq': 'теплый',
  'yengil': 'легкий',
  'qalin': 'плотный',
  'yupqa': 'тонкий',
  'tabiiy': 'натуральный',
  'haqiqiy': 'натуральный',
  'original': 'оригинальный',
  'sifatli': 'качественный',
  'premium': 'премиум',
  'qulay': 'удобный',
  'yumshoq': 'мягкий',
  'nafis': 'изящный',
  'naqshli': 'с узором',
  'yangi': 'новый',
  'paxta': 'хлопок',
  'paxtali': 'хлопковый',
  'baxmal': 'бархат',
  'baxmalli': 'бархатный',
  'ipak': 'шелк',
  'ipakli': 'шелковый',
  'charm': 'кожаный',
  'charmli': 'кожаный',
  'jun': 'шерсть',
  'junli': 'шерстяной',
  'trikotaj': 'трикотажный',
  'ortopedik': 'ортопедический',
  'turkiya': 'турецкий',
  'italiya': 'итальянский',
  'xitoy': 'китайский',
  'o\'zbekiston': 'узбекский',

  // Colors
  'qora': 'черный',
  'oq': 'белый',
  'qizil': 'красный',
  "ko'k": 'синий',
  'moviy': 'голубой',
  'yashil': 'зеленый',
  'sariq': 'желтый',
  'jigarrang': 'коричневый',
  'kulrang': 'серый',
  'pushti': 'розовый',
  'binafsha': 'фиолетовый',
  'bordo': 'бордовый',
  'xaki': 'хаки',
  'bej': 'бежевый',
  'tillarang': 'золотистый',
  'kumushrang': 'серебристый',
  'shaffof': 'прозрачный',

  // Marketplace & Description vocabulary
  'mato': 'ткань',
  'matosi': 'ткань',
  'matodan': 'из ткани',
  'tavsif': 'описание',
  'tavsifi': 'описание',
  'mahsulot': 'товар',
  'mahsuloti': 'товар',
  'mahsulotlar': 'товары',
  'haqida': 'о товаре',
  'uchun': 'для',
  'juda': 'очень',
  'chidamli': 'долговечный',
  'foydalanish': 'использование',
  'kafolat': 'гарантия',
  'kafolati': 'гарантия',
  'o\'lcham': 'размер',
  'o\'lchami': 'размер',
  'o\'lchamlari': 'размеры',
  'rang': 'цвет',
  'rangi': 'цвет',
  'ranglari': 'цвета',
  'yetkazib': 'доставка',
  'berish': 'доставка',
  'bepul': 'бесплатно',
  'asl': 'подлинный',
  'ishonchli': 'надежный',
  'dizayn': 'дизайн',
  'dizayni': 'дизайн',
  'har': 'каждый',
  'kuni': 'день',
  'kiyish': 'носка',
  'turli': 'различные',
  'mavjud': 'в наличии',
  'to\'plam': 'комплект',
  'to\'plami': 'комплект',
  'tarkibi': 'состав',
  'ishlab': 'произведено',
  'chiqarilgan': 'производство',
  'arzon': 'доступный',
  'chegirma': 'скидка',
  'sovg\'a': 'подарок',
  'xaridor': 'покупатель',
  'xaridorlar': 'покупатели',
  'tanlov': 'выбор',
  'tanlovi': 'выбор',
  'mos': 'подходящий',
  'foydali': 'полезный',
  'mukammal': 'идеальный',
  'ajoyib': 'замечательный',
  'chiroyli': 'красивый',
  'toza': 'чистый',
  'mustahkam': 'прочный',
  'qulaylik': 'комфорт',
  'yuvish': 'стирка',
  'kiyimlar': 'одежда',
  'poyabzallar': 'обувь',
  'aksessuarlar': 'аксессуары',
  'sotuvda': 'в продаже',
  'buyurtma': 'заказ',
  'barcha': 'все',
  'fasl': 'сезон',
  'mavsum': 'сезон',
  'fasllar': 'сезоны',
  'mavsumiy': 'сезонный',
  'nafislik': 'изящество',
  'zamonaviylik': 'современность',

  // Conjunctions & Particles
  'va': 'и',
  'bilan': 'с',
  'ham': 'также',
  'esa': 'а',
  'lekin': 'но',
  'chunki': 'потому что',
  'ushbu': 'этот',
  'bu': 'это',
  'hamma': 'все',
  'faqat': 'только',
  'yaxshi': 'хороший',
  'a\'lo': 'отличный',
  'kerak': 'необходимо',
  'mumkin': 'можно',

  // Common Verbs / Participles
  'tayyorlangan': 'изготовлен',
  'yaratilgan': 'создан',
  'tikilgan': 'сшит',
  'to\'qilgan': 'соткан',
  'keladi': 'подходит',
  'beradi': 'придает',
  'ta\'minlaydi': 'обеспечивает',
  'saqlaydi': 'сохраняет',
  'yoqadi': 'нравится',
  'o\'chmaydi': 'не выцветает',
  'cho\'zilmaydi': 'не растягивается',
  'yirtilmaydi': 'не рвется',
  'kafolatlanadi': 'гарантируется',
  'yetkaziladi': 'доставляется',
  'sotiladi': 'продается',
  'yuvganda': 'при стирке',
  'kiyishda': 'при носке',
  'kiyishga': 'для носки',
  'ishlatishda': 'при использовании',

  // Suffix roots & materials
  'paxtadan': 'из хлопка',
  'charmdan': 'из кожи',
  'ipakdan': 'из шелка',
  'jundan': 'из шерсти',
  'baxmaldan': 'из бархата',
  'hamyonbop': 'доступный',
  'shinam': 'уютный',
  'salqin': 'прохладный',
  'elastik': 'эластичный',
  'cho\'ziluvchan': 'стрейч',
  'sirpanmaydigan': 'нескользящий',
  'xavfsiz': 'безопасный',
  'zararsiz': 'безвредный',
  'brendli': 'фирменный',
  'rasmiy': 'официальный',
  'razmerlari': 'размеры',
  'razmeri': 'размер',
  'narxi': 'цена',
  'narxlari': 'цены',
  'fasoni': 'фасон',
  'modeli': 'модель',
  'donasi': 'штука',
  'dona': 'штук',
  'juft': 'пара',
  'qadog\'i': 'упаковка',
  'qadoq': 'упаковка',
  'etiladi': 'рекомендуется',
  'hadya': 'подарок',
  'tanaga': 'к телу',
  'badanga': 'к коже',
  'oyoqqa': 'на ноги',
  'qo\'lga': 'на руки'
};

const WORD_MAP_EN: Record<string, string> = {
  // Genders
  'erkaklar': "men's",
  'erkak': "men's",
  'ayollar': "women's",
  'ayol': "women's",
  'bolalar': "kids'",
  'bola': "kid's",
  "o'g'il": "boys'",
  'qiz': "girls'",
  'yoshlar': 'youth',
  'uniseks': 'unisex',
  'unisex': 'unisex',

  // Clothing
  'kiyim': 'clothing',
  'kiyimi': 'clothing',
  'kostyum': 'suit',
  'kostyumi': 'suit',
  'shim': 'trousers',
  'shimi': 'trousers',
  'jinsi': 'jeans',
  "ko'ylak": 'shirt',
  "ko'ylagi": 'shirt',
  'futbolka': 't-shirt',
  'futbolkasi': 't-shirt',
  'polo': 'polo',
  'kurtka': 'jacket',
  'kurtkasi': 'jacket',
  'palto': 'coat',
  'plash': 'raincoat',
  'sviter': 'sweater',
  'sviteri': 'sweater',
  'xudi': 'hoodie',
  'tolstovka': 'sweatshirt',
  'jempir': 'jumper',
  'kardigan': 'cardigan',
  'nimcha': 'vest',
  'jilet': 'vest',
  'yubka': 'skirt',
  'yubkasi': 'skirt',
  'shortik': 'shorts',
  'shorti': 'shorts',
  'paypoq': 'socks',
  'paypog\'i': 'socks',
  'pijama': 'pajamas',
  'xalat': 'robe',
  "do'ppi": 'skullcap (doppi)',
  "do'ppisi": 'skullcap',
  'joynamoz': 'prayer mat',
  'joynamozi': 'prayer mat',
  'tasbeh': 'prayer beads',
  'tasbehi': 'prayer beads',
  'hijob': 'hijab',
  "ro'mol": 'scarf',
  'qalpoq': 'beanie',
  'shapka': 'hat',
  'kepka': 'cap',
  'sharf': 'scarf',
  "qo'lqop": 'gloves',
  'kamar': 'belt',

  // Shoes
  'krossovka': 'sneakers',
  'krossovkasi': 'sneakers',
  'keda': 'canvas shoes',
  'kedasi': 'canvas shoes',
  'tufli': 'shoes',
  'tuflisi': 'shoes',
  'etik': 'boots',
  'etigi': 'boots',
  'mokasina': 'moccasins',
  'slipon': 'slip-ons',
  'sandal': 'sandals',
  'sandali': 'sandals',
  'shippak': 'slippers',
  'tapochka': 'slippers',
  'botinka': 'boots',

  // Accessories & Items
  'sumka': 'bag',
  'sumkasi': 'bag',
  'ryukzak': 'backpack',
  'ryukzaki': 'backpack',
  'hamyon': 'wallet',
  'soat': 'watch',
  'atir': 'perfume',
  'atiri': 'perfume',
  'mushk': 'musk',
  'krem': 'cream',
  'kremi': 'cream',
  'shampun': 'shampoo',
  'sovun': 'soap',
  'telefon': 'smartphone',
  'smartfon': 'smartphone',
  'noutbuk': 'laptop',
  'planshet': 'tablet',
  'quloqchin': 'earphones',
  'naushnik': 'headphones',
  'zaryadka': 'charger',
  'powerbank': 'power bank',
  'chexol': 'case',
  'kolonka': 'speaker',
  'chiroq': 'lamp',
  'lampa': 'lamp',
  'fen': 'hair dryer',
  'dazmol': 'iron',
  'changyutgich': 'vacuum cleaner',
  'choynak': 'kettle',
  'termos': 'thermos',
  'yostiq': 'pillow',
  'adyol': 'blanket',
  'choyshab': 'bedsheet',
  'sochiq': 'towel',

  // Adjectives & Qualities
  'klassik': 'classic',
  'zamonaviy': 'modern',
  'sportiv': 'sporty',
  'sport': 'sporty',
  'kundalik': 'casual',
  'yozgi': 'summer',
  'qishki': 'winter',
  'bahorgi': 'spring',
  'kuzgi': 'autumn',
  'issiq': 'warm',
  'yengil': 'lightweight',
  'qalin': 'thick',
  'yupqa': 'thin',
  'tabiiy': 'natural',
  'haqiqiy': 'genuine',
  'original': 'original',
  'sifatli': 'high quality',
  'premium': 'premium',
  'qulay': 'comfortable',
  'yumshoq': 'soft',
  'nafis': 'elegant',
  'naqshli': 'patterned',
  'yangi': 'new',
  'paxta': 'cotton',
  'paxtali': 'cotton',
  'baxmal': 'velvet',
  'baxmalli': 'velvet',
  'ipak': 'silk',
  'ipakli': 'silk',
  'charm': 'leather',
  'charmli': 'leather',
  'jun': 'wool',
  'junli': 'wool',
  'trikotaj': 'knitted',
  'ortopedik': 'orthopedic',
  'turkiya': 'Turkish',
  'italiya': 'Italian',
  'xitoy': 'Chinese',
  'o\'zbekiston': 'Uzbek',

  // Colors
  'qora': 'black',
  'oq': 'white',
  'qizil': 'red',
  "ko'k": 'blue',
  'moviy': 'light blue',
  'yashil': 'green',
  'sariq': 'yellow',
  'jigarrang': 'brown',
  'kulrang': 'gray',
  'pushti': 'pink',
  'binafsha': 'purple',
  'bordo': 'burgundy',
  'xaki': 'khaki',
  'bej': 'beige',
  'tillarang': 'golden',
  'kumushrang': 'silver',
  'shaffof': 'transparent',

  // Marketplace & Description vocabulary
  'mato': 'fabric',
  'matosi': 'fabric',
  'matodan': 'made of fabric',
  'tavsif': 'description',
  'tavsifi': 'description',
  'mahsulot': 'product',
  'mahsuloti': 'product',
  'mahsulotlar': 'products',
  'haqida': 'about the product',
  'uchun': 'for',
  'juda': 'very',
  'chidamli': 'durable',
  'foydalanish': 'usage',
  'kafolat': 'warranty',
  'kafolati': 'warranty',
  'o\'lcham': 'size',
  'o\'lchami': 'size',
  'o\'lchamlari': 'sizes',
  'rang': 'color',
  'rangi': 'color',
  'ranglari': 'colors',
  'yetkazib': 'delivery',
  'berish': 'delivery',
  'bepul': 'free',
  'asl': 'authentic',
  'ishonchli': 'reliable',
  'dizayn': 'design',
  'dizayni': 'design',
  'har': 'every',
  'kuni': 'day',
  'kiyish': 'wear',
  'turli': 'various',
  'mavjud': 'available in stock',
  'to\'plam': 'set',
  'to\'plami': 'set',
  'tarkibi': 'composition',
  'ishlab': 'manufacture',
  'chiqarilgan': 'produced',
  'arzon': 'affordable',
  'chegirma': 'discount',
  'sovg\'a': 'gift',
  'xaridor': 'customer',
  'xaridorlar': 'customers',
  'tanlov': 'choice',
  'tanlovi': 'choice',
  'mos': 'suitable',
  'foydali': 'useful',
  'mukammal': 'perfect',
  'ajoyib': 'wonderful',
  'chiroyli': 'beautiful',
  'toza': 'pure',
  'mustahkam': 'sturdy',
  'qulaylik': 'comfort',
  'yuvish': 'washing',
  'kiyimlar': 'clothing',
  'poyabzallar': 'shoes',
  'aksessuarlar': 'accessories',
  'sotuvda': 'in stock',
  'buyurtma': 'order',
  'barcha': 'all',
  'fasl': 'season',
  'mavsum': 'season',
  'fasllar': 'seasons',
  'mavsumiy': 'seasonal',
  'nafislik': 'elegance',
  'zamonaviylik': 'modernity',

  // Conjunctions & Particles
  'va': 'and',
  'bilan': 'with',
  'ham': 'also',
  'esa': 'while',
  'lekin': 'but',
  'chunki': 'because',
  'ushbu': 'this',
  'bu': 'this',
  'hamma': 'all',
  'faqat': 'only',
  'yaxshi': 'good',
  'a\'lo': 'excellent',
  'kerak': 'required',
  'mumkin': 'possible',

  // Common Verbs / Participles
  'tayyorlangan': 'crafted',
  'yaratilgan': 'created',
  'tikilgan': 'stitched',
  'to\'qilgan': 'woven',
  'keladi': 'fits',
  'beradi': 'provides',
  'ta\'minlaydi': 'ensures',
  'saqlaydi': 'preserves',
  'yoqadi': 'pleases',
  'o\'chmaydi': 'does not fade',
  'cho\'zilmaydi': 'does not stretch',
  'yirtilmaydi': 'does not tear',
  'kafolatlanadi': 'is guaranteed',
  'yetkaziladi': 'is delivered',
  'sotiladi': 'sold',
  'yuvganda': 'when washing',
  'kiyishda': 'when wearing',
  'kiyishga': 'for wearing',
  'ishlatishda': 'in use',

  // Suffix roots & materials
  'paxtadan': 'made of cotton',
  'charmdan': 'made of leather',
  'ipakdan': 'made of silk',
  'jundan': 'made of wool',
  'baxmaldan': 'made of velvet',
  'hamyonbop': 'budget-friendly',
  'shinam': 'cozy',
  'salqin': 'cool',
  'elastik': 'elastic',
  'cho\'ziluvchan': 'stretch',
  'sirpanmaydigan': 'non-slip',
  'xavfsiz': 'safe',
  'zararsiz': 'non-toxic',
  'brendli': 'designer',
  'rasmiy': 'official',
  'razmerlari': 'sizes',
  'razmeri': 'size',
  'narxi': 'price',
  'narxlari': 'prices',
  'fasoni': 'cut',
  'modeli': 'model',
  'donasi': 'piece',
  'dona': 'pieces',
  'juft': 'pair',
  'qadog\'i': 'package',
  'qadoq': 'package',
  'etiladi': 'is recommended',
  'hadya': 'present',
  'tanaga': 'to skin',
  'badanga': 'to body',
  'oyoqqa': 'for feet',
  'qo\'lga': 'for hands'
};

const COLOR_NAMES: Record<string, { ru: string; en: string }> = {
  'qora': { ru: 'Черный', en: 'Black' },
  'oq': { ru: 'Белый', en: 'White' },
  'qizil': { ru: 'Красный', en: 'Red' },
  "ko'k": { ru: 'Синий', en: 'Blue' },
  'moviy': { ru: 'Голубой', en: 'Light Blue' },
  'yashil': { ru: 'Зеленый', en: 'Green' },
  'sariq': { ru: 'Желтый', en: 'Yellow' },
  'jigarrang': { ru: 'Коричневый', en: 'Brown' },
  'kulrang': { ru: 'Серый', en: 'Gray' },
  'pushti': { ru: 'Розовый', en: 'Pink' },
  'binafsha': { ru: 'Фиолетовый', en: 'Purple' },
  'bordo': { ru: 'Бордовый', en: 'Burgundy' },
  'xaki': { ru: 'Хаки', en: 'Khaki' },
  'bej': { ru: 'Бежевый', en: 'Beige' },
  'tillarang': { ru: 'Золотистый', en: 'Gold' },
  'kumushrang': { ru: 'Серебристый', en: 'Silver' },
  'shaffof': { ru: 'Прозрачный', en: 'Clear' },
  'standart': { ru: 'Стандарт', en: 'Standard' },
  'asosiy': { ru: 'Основной', en: 'Main' }
};

/**
 * Translates a single color name from Uzbek to Russian and English
 */
export const translateColorName = (uzColor: string): { ru: string; en: string } => {
  if (!uzColor) return { ru: 'Основной', en: 'Main' };
  const lower = uzColor.toLowerCase().trim();
  if (COLOR_NAMES[lower]) {
    return COLOR_NAMES[lower];
  }
  // Check partial match
  for (const [key, val] of Object.entries(COLOR_NAMES)) {
    if (lower.includes(key)) {
      return val;
    }
  }
  return {
    ru: WORD_MAP_RU[lower] ? capitalize(WORD_MAP_RU[lower]) : uzColor,
    en: WORD_MAP_EN[lower] ? capitalize(WORD_MAP_EN[lower]) : uzColor
  };
};

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function translitCyrillicUzToLatin(str: string): string {
  const cyrToLatMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'ъ': "'",
    'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ў': "o'", 'қ': 'q', 'ғ': "g'", 'ҳ': 'h'
  };
  return str.split('').map(char => {
    const lower = char.toLowerCase();
    const mapped = cyrToLatMap[lower];
    if (!mapped) return char;
    return char === char.toUpperCase() ? mapped.charAt(0).toUpperCase() + mapped.slice(1) : mapped;
  }).join('');
}

function translateSingleWordRu(rawWord: string): string {
  const clean = rawWord.toLowerCase().replace(/[`'’‘´]/g, "'").trim();
  if (!clean) return rawWord;
  if (WORD_MAP_RU[clean]) return WORD_MAP_RU[clean];

  // Suffix checks:
  if (clean.endsWith('dan') || clean.endsWith('tan')) {
    const stem = clean.slice(0, -3);
    if (WORD_MAP_RU[stem]) return `из ${WORD_MAP_RU[stem]}`;
  }
  if (clean.endsWith('dagi')) {
    const stem = clean.slice(0, -4);
    if (WORD_MAP_RU[stem]) return `в ${WORD_MAP_RU[stem]}`;
  }
  if (clean.endsWith('da')) {
    const stem = clean.slice(0, -2);
    if (WORD_MAP_RU[stem]) return `в ${WORD_MAP_RU[stem]}`;
  }
  if (clean.endsWith('ga') || clean.endsWith('ka') || clean.endsWith('qa')) {
    const stem = clean.slice(0, -2);
    if (WORD_MAP_RU[stem]) return `для ${WORD_MAP_RU[stem]}`;
  }
  if (clean.endsWith('lari')) {
    const stem = clean.slice(0, -4);
    if (WORD_MAP_RU[stem]) return WORD_MAP_RU[stem];
  }
  if (clean.endsWith('lar')) {
    const stem = clean.slice(0, -3);
    if (WORD_MAP_RU[stem]) return WORD_MAP_RU[stem];
  }
  if (clean.endsWith('si')) {
    const stem = clean.slice(0, -2);
    if (WORD_MAP_RU[stem]) return WORD_MAP_RU[stem];
  }
  if (clean.endsWith('i') && clean.length > 3) {
    const stem = clean.slice(0, -1);
    if (WORD_MAP_RU[stem]) return WORD_MAP_RU[stem];
  }
  if (clean.endsWith('lik')) {
    const stem = clean.slice(0, -3);
    if (WORD_MAP_RU[stem]) return WORD_MAP_RU[stem];
  }
  if (clean.endsWith('li')) {
    const stem = clean.slice(0, -2);
    if (WORD_MAP_RU[stem]) return WORD_MAP_RU[stem];
  }
  if (clean.endsWith('siz')) {
    const stem = clean.slice(0, -3);
    if (WORD_MAP_RU[stem]) return `без ${WORD_MAP_RU[stem]}`;
  }
  if (clean.endsWith('maydi')) {
    if (clean.startsWith("o'ch")) return 'не выцветает';
    if (clean.startsWith("cho'zil")) return 'не растягивается';
    if (clean.startsWith('yirtil')) return 'не рвется';
    return 'не теряет форму';
  }
  if (clean.endsWith('langan') || clean.endsWith('ilgan') || clean.endsWith('lgan')) {
    return 'изготовлен';
  }

  return rawWord;
}

function translateSingleWordEn(rawWord: string): string {
  const clean = rawWord.toLowerCase().replace(/[`'’‘´]/g, "'").trim();
  if (!clean) return rawWord;
  if (WORD_MAP_EN[clean]) return WORD_MAP_EN[clean];

  // Suffix checks:
  if (clean.endsWith('dan') || clean.endsWith('tan')) {
    const stem = clean.slice(0, -3);
    if (WORD_MAP_EN[stem]) return `made of ${WORD_MAP_EN[stem]}`;
  }
  if (clean.endsWith('dagi')) {
    const stem = clean.slice(0, -4);
    if (WORD_MAP_EN[stem]) return `in ${WORD_MAP_EN[stem]}`;
  }
  if (clean.endsWith('da')) {
    const stem = clean.slice(0, -2);
    if (WORD_MAP_EN[stem]) return `in ${WORD_MAP_EN[stem]}`;
  }
  if (clean.endsWith('ga') || clean.endsWith('ka') || clean.endsWith('qa')) {
    const stem = clean.slice(0, -2);
    if (WORD_MAP_EN[stem]) return `for ${WORD_MAP_EN[stem]}`;
  }
  if (clean.endsWith('lari')) {
    const stem = clean.slice(0, -4);
    if (WORD_MAP_EN[stem]) return `${WORD_MAP_EN[stem]}s`;
  }
  if (clean.endsWith('lar')) {
    const stem = clean.slice(0, -3);
    if (WORD_MAP_EN[stem]) return `${WORD_MAP_EN[stem]}s`;
  }
  if (clean.endsWith('si')) {
    const stem = clean.slice(0, -2);
    if (WORD_MAP_EN[stem]) return WORD_MAP_EN[stem];
  }
  if (clean.endsWith('i') && clean.length > 3) {
    const stem = clean.slice(0, -1);
    if (WORD_MAP_EN[stem]) return WORD_MAP_EN[stem];
  }
  if (clean.endsWith('lik')) {
    const stem = clean.slice(0, -3);
    if (WORD_MAP_EN[stem]) return WORD_MAP_EN[stem];
  }
  if (clean.endsWith('li')) {
    const stem = clean.slice(0, -2);
    if (WORD_MAP_EN[stem]) return WORD_MAP_EN[stem];
  }
  if (clean.endsWith('siz')) {
    const stem = clean.slice(0, -3);
    if (WORD_MAP_EN[stem]) return `${WORD_MAP_EN[stem]}-free`;
  }
  if (clean.endsWith('maydi')) {
    if (clean.startsWith("o'ch")) return 'does not fade';
    if (clean.startsWith("cho'zil")) return 'does not stretch';
    if (clean.startsWith('yirtil')) return 'does not tear';
    return 'keeps shape';
  }
  if (clean.endsWith('langan') || clean.endsWith('ilgan') || clean.endsWith('lgan')) {
    return 'crafted';
  }

  return rawWord;
}

/**
 * Intelligent Uzbek to Russian translation for marketplace titles and descriptions
 */
export const translateUzToRu = (text: string): string => {
  if (!text || !text.trim()) return '';

  let normalized = text.trim().replace(/[`'’‘´]/g, "'");
  if (/[ўқғҳ]/.test(normalized)) {
    normalized = translitCyrillicUzToLatin(normalized);
  }

  let result = normalized;

  // 1. Apply multi-word phrases
  for (const [regex, replacement] of PHRASE_DICTIONARY_RU) {
    result = result.replace(regex, replacement);
  }

  // 2. Tokenize and replace individual words
  const words = result.split(/(\s+|[.,!?:;()\-]+)/);
  const translatedWords = words.map(chunk => {
    const clean = chunk.toLowerCase().trim();
    if (!clean || /^[.,!?:;()\-]+$/.test(clean)) return chunk;
    const isFirstCap = chunk.charAt(0) === chunk.charAt(0).toUpperCase() && chunk.charAt(0).toLowerCase() !== chunk.charAt(0);
    const trans = translateSingleWordRu(chunk);
    return isFirstCap ? capitalize(trans) : trans;
  });

  result = translatedWords.join('');

  // 3. Clean up common description suffixes
  if (result.includes('Mayami')) {
    result = result.replace(/Mayami\s+platformasidagi\s+rasmiy\s+kafolatlangan\s+tovar\.?/gi, 'Официальный сертифицированный товар на платформе Mayami.');
  }

  return capitalize(result);
};

/**
 * Intelligent Uzbek to English translation for marketplace titles and descriptions
 */
export const translateUzToEn = (text: string): string => {
  if (!text || !text.trim()) return '';

  let normalized = text.trim().replace(/[`'’‘´]/g, "'");
  if (/[ўқғҳ]/.test(normalized)) {
    normalized = translitCyrillicUzToLatin(normalized);
  }

  let result = normalized;

  // 1. Apply multi-word phrases
  for (const [regex, replacement] of PHRASE_DICTIONARY_EN) {
    result = result.replace(regex, replacement);
  }

  // 2. Tokenize and replace individual words
  const words = result.split(/(\s+|[.,!?:;()\-]+)/);
  const translatedWords = words.map(chunk => {
    const clean = chunk.toLowerCase().trim();
    if (!clean || /^[.,!?:;()\-]+$/.test(clean)) return chunk;
    const isFirstCap = chunk.charAt(0) === chunk.charAt(0).toUpperCase() && chunk.charAt(0).toLowerCase() !== chunk.charAt(0);
    const trans = translateSingleWordEn(chunk);
    return isFirstCap ? capitalize(trans) : trans;
  });

  result = translatedWords.join('');

  // 3. Clean up common description suffixes
  if (result.includes('Mayami')) {
    result = result.replace(/Mayami\s+platformasidagi\s+rasmiy\s+kafolatlangan\s+tovar\.?/gi, 'Official certified product on Mayami platform.');
  }

  return capitalize(result);
};

/**
 * Auto-translates a product's name and description from Uzbek to Russian & English
 */
export const autoTranslateProduct = (
  nameUz: string,
  descUz: string
): {
  nameRu: string;
  nameEn: string;
  descRu: string;
  descEn: string;
} => {
  const cleanName = nameUz ? nameUz.trim() : '';
  const cleanDesc = descUz ? descUz.trim() : '';

  const nameRu = cleanName ? translateUzToRu(cleanName) : '';
  const nameEn = cleanName ? translateUzToEn(cleanName) : '';

  let descRu = cleanDesc ? translateUzToRu(cleanDesc) : '';
  let descEn = cleanDesc ? translateUzToEn(cleanDesc) : '';

  // If cleanDesc was provided but translation returned empty, use cleanDesc
  if (cleanDesc && !descRu) {
    descRu = cleanDesc;
  }
  if (cleanDesc && !descEn) {
    descEn = cleanDesc;
  }

  // If no description was entered at all, generate verified official marketplace text
  if (!cleanDesc) {
    if (nameRu || cleanName) {
      descRu = `${nameRu || cleanName}. Высококачественный сертифицированный товар с официальной гарантией на платформе Mayami.`;
    }
    if (nameEn || cleanName) {
      descEn = `${nameEn || cleanName}. Premium certified quality product with official guarantee on Mayami platform.`;
    }
  }

  return {
    nameRu: nameRu || cleanName,
    nameEn: nameEn || cleanName,
    descRu,
    descEn
  };
};

/**
 * Dynamic localized accessor for products.
 * If product text in the target language (ru or en) is missing or identical to Uzbek,
 * it runs auto-translation dynamically so buyers always see natural localized text!
 */
export const getLocalizedProductText = (
  product: Product | null | undefined,
  field: 'name' | 'title' | 'short_title' | 'description',
  language: Language
): string => {
  if (!product) return '';

  const targetLang = language || 'uz';

  // Dedicated handling for description to prevent fallback contamination from title/name
  if (field === 'description') {
    const uzDesc = product.description?.uz || '';
    if (targetLang === 'uz') return uzDesc;
    const existingDesc = product.description?.[targetLang];
    if (existingDesc && existingDesc.trim() && existingDesc.trim().toLowerCase() !== uzDesc.trim().toLowerCase()) {
      return existingDesc.trim();
    }
    if (targetLang === 'ru') {
      const trans = uzDesc ? translateUzToRu(uzDesc) : '';
      return trans || (uzDesc ? `${getLocalizedProductText(product, 'name', 'ru')}. Официальный сертифицированный товар на платформе Mayami.` : '');
    }
    if (targetLang === 'en') {
      const trans = uzDesc ? translateUzToEn(uzDesc) : '';
      return trans || (uzDesc ? `${getLocalizedProductText(product, 'name', 'en')}. Official certified product on Mayami platform.` : '');
    }
    return uzDesc;
  }

  const uzText = 
    product[field]?.uz || 
    product.name?.uz || 
    product.title?.uz || 
    product.short_title?.uz || 
    product.slug || 
    '';

  if (targetLang === 'uz') {
    return uzText;
  }

  const existingLocalized = product[field]?.[targetLang] || product.title?.[targetLang] || product.name?.[targetLang];

  // If already localized and not identical to Uzbek
  if (existingLocalized && existingLocalized.trim() && existingLocalized.trim().toLowerCase() !== uzText.trim().toLowerCase()) {
    return existingLocalized.trim();
  }

  // Dynamic on-the-fly translation fallback
  if (targetLang === 'ru') {
    return translateUzToRu(uzText);
  }
  if (targetLang === 'en') {
    return translateUzToEn(uzText);
  }

  return uzText;
};

/**
 * Dynamic localized accessor for color options.
 */
export const getLocalizedColorName = (
  color: ColorOption | null | undefined,
  language: Language
): string => {
  if (!color) return '';

  const targetLang = language || 'uz';
  const uzName = color.name_uz || color.hex || '';

  if (targetLang === 'uz') {
    return uzName;
  }

  const existing = color[`name_${targetLang}` as keyof typeof color] as string;
  if (existing && existing.trim() && existing.trim().toLowerCase() !== uzName.trim().toLowerCase()) {
    return existing.trim();
  }

  const autoTrans = translateColorName(uzName);
  return targetLang === 'ru' ? autoTrans.ru : autoTrans.en;
};
