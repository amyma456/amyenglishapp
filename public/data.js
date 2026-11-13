// 题库数据 —— v153 生成主题，v154/v155 裁量（tools/apply-v154-trim.js / apply-v155-slim.js）。
// v155 口径：每天恰好 30 个真实动作 —— 读一句英语算一道、翻译一句算一道、
// 答一道题算一道、一个词算一道（家长 2026-10-25：让孩子 30 分钟左右做完）。
// 阅读/完形/写作主题 = 中国文化 · 科学技术 · 现代热点。
// 改题库：改 tools/v153-content-*.js 重跑 v153 脚本，再依次跑 v154/v155 脚本，最后 node tools/verify-weeks.js。

const WEEK1 = [
  {
    "day_cn": "周一",
    "day_en": "Monday",
    "is_speaking_day": true,
    "total_duration": 50,
    "theme_cn": "AI口语 + 高频词汇 + 阅读理解",
    "modules": [
      {
        "id": "mon-speaking",
        "name_cn": "AI口语练习",
        "type": "speaking",
        "duration": 30,
        "questions": [
          {
            "id": "mon-sp1",
            "sentence": "What's your favorite subject at school?",
            "sentence_cn": "你在学校最喜欢的科目是什么？",
            "options": [
              "My favorite subject is English.",
              "I like playing football.",
              "I have lunch at noon.",
              "I go to school by bus."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 favorite 的发音，美音重音在第一音节 fa-vo-rite，/ˈfeɪvərɪt/",
            "explanation_cn": "这是一道日常对话题，询问最喜欢的科目。回答时应直接说出科目名称，使用 My favorite subject is... 的句型。注意 subject 的发音，/ˈsʌbdʒekt/，重音在第一音节。",
            "explanation_en": "This is a daily conversation question asking about your favorite subject. You should directly state the subject using 'My favorite subject is...'. Note the pronunciation of 'subject' with stress on the first syllable /ˈsʌbdʒekt/.",
            "answer_cn_hint": "它在问「哪一门科目」，答句只要说出一个科目名，别的都不用说。",
            "options_cn": [
              "我最喜欢的科目是英语。",
              "我喜欢踢足球。",
              "我中午吃午饭。",
              "我坐公交车去上学。"
            ]
          },
          {
            "id": "mon-sp2",
            "sentence": "How do you go to school every day?",
            "sentence_cn": "你每天怎么去上学？",
            "options": [
              "I go to school by bus.",
              "I like reading books.",
              "My school is big.",
              "I have five classes."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 school 中 sch 的发音 /sk/，不要读成 /ʃ/；by bus 连读时注意过渡自然",
            "explanation_cn": "这题询问出行方式。常用回答：by bus/car/bike/subway 或 on foot。注意 means of transportation 前面用 by，不用 by a。school 的 sch 发 /sk/ 音，不是 /ʃ/。",
            "explanation_en": "This question asks about transportation. Common answers: by bus/car/bike/subway or on foot. Note that we use 'by' without 'a' before the transport. The 'sch' in 'school' is pronounced /sk/, not /ʃ/.",
            "answer_cn_hint": "它在问「用什么方式去」，答句要说走路、骑车、坐公交车这类出行方式。",
            "options_cn": [
              "我坐公交车去上学。",
              "我喜欢读书。",
              "我的学校很大。",
              "我有五节课。"
            ]
          },
          {
            "id": "mon-sp3",
            "sentence": "What did you do last weekend?",
            "sentence_cn": "你上周末做了什么？",
            "options": [
              "I went to the park with my family.",
              "I am doing my homework.",
              "I will visit my grandma.",
              "I like swimming."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 last weekend 中 last 的 /æ/ 音要发饱满，went 是 go 的过去式 /went/",
            "explanation_cn": "这题用一般过去时询问上周末活动。注意问题用 did，回答动词要用过去式（went, played, visited 等）。不能回答现在进行时或将来时，时态必须一致。",
            "explanation_en": "This question uses the simple past tense to ask about last weekend. Since the question uses 'did', the answer must use past tense verbs (went, played, visited). The tense must be consistent.",
            "answer_cn_hint": "它在问「上周末做了什么」，答句要说过去做过的一件事，动词要用过去式。",
            "options_cn": [
              "我和家人去了公园。",
              "我正在做作业。",
              "我将去看望奶奶。",
              "我喜欢游泳。"
            ]
          },
          {
            "id": "mon-sp4",
            "sentence": "Can you tell me about your family?",
            "sentence_cn": "你能告诉我你的家庭情况吗？",
            "options": [
              "Sure! There are four people in my family: my parents, my sister and me.",
              "I have a pet dog.",
              "My school is far away.",
              "I don't like vegetables."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 family 的发音 /ˈfæməli/，美音常弱化为 /ˈfæmli/；parents 注意 /peərənts/ 的双元音",
            "explanation_cn": "这是开放式家庭介绍题。回答时应包括家庭人数和成员。常用句型：There are... people in my family. 注意介绍自己时放在最后：my parents, my sister and me（不是 I）。",
            "explanation_en": "This is an open-ended question about family. Your answer should include the number of family members and who they are. Common pattern: 'There are... people in my family.' Note: when listing family members, put yourself last using 'me' not 'I'.",
            "answer_cn_hint": "这是在请你介绍家人，答句要说家里有谁，而不是说宠物、学校或吃的。",
            "options_cn": [
              "当然！我家有四口人：爸爸、妈妈、姐姐和我。",
              "我有一只宠物狗。",
              "我的学校离家很远。",
              "我不喜欢蔬菜。"
            ]
          },
          {
            "id": "mon-sp5",
            "sentence": "What do you want to be when you grow up?",
            "sentence_cn": "你长大后想成为什么？",
            "options": [
              "I want to be a doctor because I want to help sick people.",
              "I am ten years old.",
              "I like playing games.",
              "My mother is a teacher."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 grow up 连读，grow 的 /gr/ 和 up 的 /ʌ/ 要自然过渡；because 重音在第二音节 /bɪˈkɒz/",
            "explanation_cn": "这题询问未来理想职业。回答格式：I want to be a/an + 职业名词 + because + 原因。注意职业前用 a 或 an（元音前用 an，如 an engineer）。grow up 是固定短语，意思是长大。",
            "explanation_en": "This question asks about future career aspirations. Answer format: I want to be a/an + job + because + reason. Note: use 'an' before vowels (e.g., an engineer). 'Grow up' is a fixed phrase meaning to become an adult.",
            "answer_cn_hint": "它在问「将来想做什么职业」，答句要说出一种职业，最好再说说为什么。",
            "options_cn": [
              "我想当医生，因为我想帮助生病的人。",
              "我今年十岁。",
              "我喜欢玩游戏。",
              "我妈妈是老师。"
            ]
          }
        ]
      },
      {
        "id": "mon-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "beautiful",
            "phonetic": "/ˈbjuːtɪfəl/",
            "meaning": "美丽的，漂亮的",
            "emoji": "🌸",
            "example_en": "The sunset is beautiful.",
            "example_cn": "日落很美丽。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🪨",
                  "⚽",
                  "🏃",
                  "🌸"
                ],
                "answer": 3
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🔍",
                  "😈",
                  "🌸",
                  "🐛"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "beautiful 是什么意思？（1/2）",
                "options": [
                  "庆祝",
                  "图书馆",
                  "美丽的，漂亮的",
                  "诚实的"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "beautiful 是什么意思？（2/2）",
                "options": [
                  "图书馆",
                  "诚实的",
                  "发现",
                  "美丽的，漂亮的"
                ],
                "answer": 3
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: bea__ti__ul",
                "answer": "uf"
              }
            ],
            "letters": [
              "b",
              "e",
              "a",
              "u",
              "t",
              "i",
              "f",
              "u",
              "l"
            ],
            "syllables": [
              "beau",
              "ti",
              "ful"
            ],
            "hint_cn": "看到花、看到晚霞，心里觉得“真好看”的那种感觉"
          },
          {
            "word": "library",
            "phonetic": "/ˈlaɪbrəri/",
            "meaning": "图书馆",
            "emoji": "📖",
            "example_en": "I read books in the library.",
            "example_cn": "我在图书馆看书。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "📖",
                  "🍰",
                  "🏀",
                  "🌧️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🐰",
                  "📖",
                  "🪨",
                  "🌧️"
                ],
                "answer": 1
              },
              {
                "type": "meaning_choice",
                "prompt": "library 是什么意思？（1/2）",
                "options": [
                  "庆祝",
                  "诚实的",
                  "图书馆",
                  "美丽的，漂亮的"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "library 是什么意思？（2/2）",
                "options": [
                  "图书馆",
                  "庆祝",
                  "诚实的",
                  "发现"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: li__r__ry",
                "answer": "ba"
              }
            ],
            "letters": [
              "l",
              "i",
              "b",
              "r",
              "a",
              "r",
              "y"
            ],
            "syllables": [
              "li",
              "bra",
              "ry"
            ],
            "hint_cn": "一个很安静的地方，书很多，可以把书借回家看"
          },
          {
            "word": "honest",
            "phonetic": "/ˈɒnɪst/",
            "meaning": "诚实的",
            "emoji": "🤝",
            "example_en": "He is an honest boy.",
            "example_cn": "他是一个诚实的男孩。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "⚽",
                  "🏀",
                  "🐌",
                  "🤝"
                ],
                "answer": 3
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🌧️",
                  "🔍",
                  "🐛",
                  "🤝"
                ],
                "answer": 3
              },
              {
                "type": "meaning_choice",
                "prompt": "honest 是什么意思？（1/2）",
                "options": [
                  "发现",
                  "美丽的，漂亮的",
                  "诚实的",
                  "图书馆"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "honest 是什么意思？（2/2）",
                "options": [
                  "美丽的，漂亮的",
                  "图书馆",
                  "发现",
                  "诚实的"
                ],
                "answer": 3
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: ho__e__t",
                "answer": "ns"
              }
            ],
            "letters": [
              "h",
              "o",
              "n",
              "e",
              "s",
              "t"
            ],
            "syllables": [
              "ho",
              "nest"
            ],
            "hint_cn": "说真话、不骗人，答应过的事一定做到"
          },
          {
            "word": "celebrate",
            "phonetic": "/ˈselɪbreɪt/",
            "meaning": "庆祝",
            "emoji": "🎉",
            "example_en": "We celebrate Christmas together.",
            "example_cn": "我们一起庆祝圣诞节。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🤝",
                  "🍔",
                  "🎉",
                  "📚"
                ],
                "answer": 2
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🐌",
                  "😈",
                  "🎉",
                  "🌧️"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "celebrate 是什么意思？（1/2）",
                "options": [
                  "美丽的，漂亮的",
                  "诚实的",
                  "庆祝",
                  "图书馆"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "celebrate 是什么意思？（2/2）",
                "options": [
                  "诚实的",
                  "图书馆",
                  "庆祝",
                  "发现"
                ],
                "answer": 2
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: cel__br__te",
                "answer": "ea"
              }
            ],
            "letters": [
              "c",
              "e",
              "l",
              "e",
              "b",
              "r",
              "a",
              "t",
              "e"
            ],
            "syllables": [
              "ce",
              "le",
              "brate"
            ],
            "hint_cn": "生日那天、过节那天，大家一起热闹一下"
          },
          {
            "word": "discover",
            "phonetic": "/dɪˈskʌvə/",
            "meaning": "发现",
            "emoji": "🔍",
            "example_en": "Scientists discover new things.",
            "example_cn": "科学家发现新事物。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🌧️",
                  "😴",
                  "🔍",
                  "😴"
                ],
                "answer": 2
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🔍",
                  "📚",
                  "🍔",
                  "⚽"
                ],
                "answer": 0
              },
              {
                "type": "meaning_choice",
                "prompt": "discover 是什么意思？（1/2）",
                "options": [
                  "发现",
                  "图书馆",
                  "庆祝",
                  "诚实的"
                ],
                "answer": 0
              },
              {
                "type": "meaning_choice",
                "prompt": "discover 是什么意思？（2/2）",
                "options": [
                  "发现",
                  "庆祝",
                  "图书馆",
                  "美丽的，漂亮的"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: di__co__er",
                "answer": "sv"
              }
            ],
            "letters": [
              "d",
              "i",
              "s",
              "c",
              "o",
              "v",
              "e",
              "r"
            ],
            "syllables": [
              "dis",
              "co",
              "ver"
            ],
            "hint_cn": "原来不知道的东西，忽然被找到了"
          }
        ]
      },
      {
        "id": "mon-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "The Spring Festival is the most important festival in China. It usually comes in January or February. Before the festival, people clean their houses and buy new clothes. On New Year's Eve, the whole family get together and enjoy a big dinner. Children love this festival best because they can get lucky money in red envelopes. During the festival, people visit relatives and friends, and say 'Happy New Year' to each other.",
        "passage_cn": "春节是中国最重要的节日。它通常在一月或二月到来。节日前，人们打扫房子、买新衣服。除夕夜，全家人聚在一起吃一顿丰盛的年夜饭。孩子们最喜欢这个节日，因为他们可以收到红包里的压岁钱。节日期间，人们走亲访友，互相说「新年快乐」。",
        "questions": [
          {
            "id": "mon-rd1",
            "type": "choice",
            "question": "What is the most important festival in China?",
            "options": [
              "The Mid-Autumn Festival",
              "The Dragon Boat Festival",
              "The Spring Festival",
              "Christmas"
            ],
            "answer": 2,
            "explanation_cn": "第一句：The Spring Festival is the most important festival in China。"
          },
          {
            "id": "mon-rd2",
            "type": "choice",
            "question": "When does the Spring Festival usually come?",
            "options": [
              "In March or April",
              "In June or July",
              "In November or December",
              "In January or February"
            ],
            "answer": 3,
            "explanation_cn": "第二句：usually comes in January or February（一月或二月）。"
          },
          {
            "id": "mon-rd5",
            "type": "choice",
            "question": "Why do children love the Spring Festival best?",
            "options": [
              "They can get lucky money.",
              "They can sleep all day.",
              "They can watch TV all night.",
              "They don't have dinner."
            ],
            "answer": 0,
            "explanation_cn": "孩子们最喜欢春节，因为可以收到压岁钱（lucky money）。"
          },
          {
            "id": "mon-rd10",
            "type": "choice",
            "question": "What is the passage mainly about?",
            "options": [
              "The Great Wall.",
              "The Spring Festival.",
              "Giant pandas.",
              "Chinese tea."
            ],
            "answer": 1,
            "explanation_cn": "全文围绕春节展开：时间、习俗、年夜饭、压岁钱。"
          }
        ]
      },
      {
        "id": "mon-mc",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 5,
        "questions": [
          {
            "id": "mon-mc1",
            "type": "choice",
            "question": "The Spring Festival ___ the most important festival in China.",
            "options": [
              "is",
              "are",
              "am",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "主语 the Spring Festival 是单数，be 动词用 is。"
          },
          {
            "id": "mon-mc2",
            "type": "choice",
            "question": "People usually clean their houses ___ the festival.",
            "options": [
              "before",
              "after",
              "under",
              "between"
            ],
            "answer": 0,
            "explanation_cn": "节日「之前」打扫房子，用 before。"
          },
          {
            "id": "mon-mc3",
            "type": "choice",
            "question": "There ___ many lanterns in the street at night.",
            "options": [
              "are",
              "is",
              "am",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "lanterns 是复数，There be 用 are。"
          },
          {
            "id": "mon-mc4",
            "type": "choice",
            "question": "Children can get lucky money ___ red envelopes.",
            "options": [
              "in",
              "on",
              "at",
              "of"
            ],
            "answer": 0,
            "explanation_cn": "「在红包里」用 in red envelopes。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周二",
    "day_en": "Tuesday",
    "is_speaking_day": false,
    "total_duration": 30,
    "theme_cn": "阅读理解 + 语法练习 + 单项选择",
    "modules": [
      {
        "id": "tue-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "The Great Wall is one of the greatest wonders in the world. It is in the north of China. It is more than 20000 kilometres long, like a huge dragon on the mountains. People started to build it over 2000 years ago. In old times, soldiers stood on the wall and watched for enemies. Today, many visitors from all over the world come to climb the Great Wall every year.",
        "passage_cn": "长城是世界上最伟大的奇迹之一。它在中国的北方。它有两万多公里长，像一条卧在群山上的巨龙。人们两千多年前就开始修建它了。古时候，士兵们站在城墙上瞭望敌人。如今，每年都有来自世界各地的游客来爬长城。",
        "questions": [
          {
            "id": "tue-rd1",
            "type": "choice",
            "question": "Where is the Great Wall?",
            "options": [
              "In the south of China",
              "In the west of China",
              "In the north of China",
              "In the east of China"
            ],
            "answer": 2,
            "explanation_cn": "第二句：It is in the north of China（在北方）。"
          },
          {
            "id": "tue-rd2",
            "type": "choice",
            "question": "How long is the Great Wall?",
            "options": [
              "More than 20000 kilometres",
              "About 2000 kilometres",
              "About 200 kilometres",
              "More than 2 kilometres"
            ],
            "answer": 0,
            "explanation_cn": "第三句：more than 20000 kilometres long（两万多公里）。"
          },
          {
            "id": "tue-rd4",
            "type": "choice",
            "question": "When did people start to build it?",
            "options": [
              "Over 2000 years ago",
              "200 years ago",
              "20 years ago",
              "Over 20000 years ago"
            ],
            "answer": 0,
            "explanation_cn": "第四句：over 2000 years ago（两千多年前）。"
          },
          {
            "id": "tue-rd10",
            "type": "choice",
            "question": "The best title (标题) for the passage is ___.",
            "options": [
              "Soldiers in Old China",
              "Mountains in the North",
              "The Great Wall",
              "A Trip to Beijing"
            ],
            "answer": 2,
            "explanation_cn": "全文都在介绍长城：位置、长度、历史和今天。"
          }
        ]
      },
      {
        "id": "tue-grammar",
        "name_cn": "语法练习",
        "type": "grammar",
        "duration": 10,
        "questions": [
          {
            "id": "tue-gr1",
            "type": "choice",
            "question": "There ___ many towers on the Great Wall.",
            "options": [
              "are",
              "is",
              "am",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "towers 是复数，There be 用 are。"
          },
          {
            "id": "tue-gr2",
            "type": "choice",
            "question": "People built the wall ___ 2000 years.",
            "options": [
              "over",
              "on",
              "at",
              "to"
            ],
            "answer": 0,
            "explanation_cn": "over 2000 years：两千多年，over 表示「超过」。"
          },
          {
            "id": "tue-gr3",
            "type": "choice",
            "question": "The soldiers were very ___.",
            "options": [
              "brave",
              "bravely",
              "braveness",
              "braver"
            ],
            "answer": 0,
            "explanation_cn": "be 动词后面用形容词 brave（勇敢的）作表语。"
          },
          {
            "id": "tue-gr4",
            "type": "choice",
            "question": "My father ___ me to the Great Wall when I was six.",
            "options": [
              "took",
              "takes",
              "take",
              "taking"
            ],
            "answer": 0,
            "explanation_cn": "when I was six 是过去时间，用过去式 took（take 的过去式）。"
          },
          {
            "id": "tue-gr5",
            "type": "choice",
            "question": "We walked for three hours ___ we got to the top.",
            "options": [
              "before",
              "after",
              "so",
              "but"
            ],
            "answer": 0,
            "explanation_cn": "走了三个小时「才/在…之前」到达山顶，用 before。"
          },
          {
            "id": "tue-gr6",
            "type": "choice",
            "question": "The Great Wall is ___ than my school.",
            "options": [
              "much longer",
              "more longer",
              "longest",
              "long"
            ],
            "answer": 0,
            "explanation_cn": "than 比较级：much longer（长得多）。"
          }
        ]
      },
      {
        "id": "tue-choice",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 10,
        "questions": [
          {
            "id": "tue-mc1",
            "type": "choice",
            "question": "The Great Wall ___ more than 20000 kilometres long.",
            "options": [
              "is",
              "are",
              "am",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "主语 the Great Wall 是单数，用 is。"
          },
          {
            "id": "tue-mc2",
            "type": "choice",
            "question": "It looks like a huge dragon ___ the mountains.",
            "options": [
              "on",
              "in",
              "under",
              "at"
            ],
            "answer": 0,
            "explanation_cn": "「在群山上」用 on the mountains。"
          },
          {
            "id": "tue-mc3",
            "type": "choice",
            "question": "People ___ to build it over 2000 years ago.",
            "options": [
              "started",
              "start",
              "starts",
              "starting"
            ],
            "answer": 0,
            "explanation_cn": "over 2000 years ago 是过去时间，用过去式 started。"
          },
          {
            "id": "tue-mc4",
            "type": "choice",
            "question": "In old times, soldiers ___ on the wall and watched for enemies.",
            "options": [
              "stood",
              "stand",
              "stands",
              "standing"
            ],
            "answer": 0,
            "explanation_cn": "and 连接并列的过去动作，用 stood（stand 的过去式）。"
          },
          {
            "id": "tue-mc5",
            "type": "choice",
            "question": "___ visitors come to climb the Great Wall every year!",
            "options": [
              "Many",
              "Much",
              "A lot",
              "Little"
            ],
            "answer": 0,
            "explanation_cn": "visitors 是可数复数，用 Many；much 修饰不可数名词。"
          },
          {
            "id": "tue-mc6",
            "type": "choice",
            "question": "The Great Wall is one of the greatest ___ in the world.",
            "options": [
              "wonders",
              "wonder",
              "wondering",
              "wondered"
            ],
            "answer": 0,
            "explanation_cn": "one of + 复数名词：最伟大的奇迹之一。"
          },
          {
            "id": "tue-mc7",
            "type": "choice",
            "question": "We climbed the Great Wall ___ last summer.",
            "options": [
              "happy",
              "happily",
              "happyly",
              "happiness"
            ],
            "answer": 1,
            "explanation_cn": "修饰动词 climbed 用副词 happily（快乐的地）。"
          },
          {
            "id": "tue-mc8",
            "type": "choice",
            "question": "___ long the Great Wall is!",
            "options": [
              "How",
              "What",
              "Where",
              "Why"
            ],
            "answer": 0,
            "explanation_cn": "How + 形容词：How long the Great Wall is!（多长啊！）"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周三",
    "day_en": "Wednesday",
    "is_speaking_day": true,
    "total_duration": 50,
    "theme_cn": "AI口语 + 高频词汇 + 阅读理解",
    "modules": [
      {
        "id": "wed-speaking",
        "name_cn": "AI口语练习",
        "type": "speaking",
        "duration": 30,
        "questions": [
          {
            "id": "wed-sp1",
            "sentence": "What time do you usually get up in the morning?",
            "sentence_cn": "你通常早上几点起床？",
            "options": [
              "I usually get up at 6:30 in the morning.",
              "I am eating breakfast.",
              "I like sleeping.",
              "It is morning."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 usually 的发音 /ˈjuːʒuəli/，中间的 s 发 /ʒ/ 音；get up 连读时 t 弱化",
            "explanation_cn": "这题询问日常作息时间。回答用 I usually + 动词 + at + 时间。usually 是频度副词，放在实义动词前。注意时间表达：6:30 读作 six thirty 或 half past six。",
            "explanation_en": "This question asks about daily routine time. Answer: I usually + verb + at + time. 'Usually' is an adverb of frequency placed before the main verb. Time expression: 6:30 can be read as 'six thirty' or 'half past six'.",
            "answer_cn_hint": "它在问「几点」，答句里一定要出现一个具体的时间，比如 at 6:30。",
            "options_cn": [
              "我通常早上六点半起床。",
              "我正在吃早饭。",
              "我喜欢睡觉。",
              "现在是早上。"
            ]
          },
          {
            "id": "wed-sp2",
            "sentence": "What's the weather like today?",
            "sentence_cn": "今天天气怎么样？",
            "options": [
              "It's sunny and warm today.",
              "I like summer.",
              "My favorite color is blue.",
              "I don't know."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 weather 的 th 发 /ð/（浊音），不要发成 /θ/；sunny 和 warm 之间停顿一下",
            "explanation_cn": "What's the weather like? 是询问天气的常用句型。回答用 It's + 天气形容词。常用天气词：sunny, cloudy, rainy, windy, snowy, foggy。注意 weather 不可数名词，不能用 a/an。",
            "explanation_en": "'What's the weather like?' is a common pattern for asking about weather. Answer: It's + weather adjective. Common weather words: sunny, cloudy, rainy, windy, snowy, foggy. Note: 'weather' is an uncountable noun.",
            "answer_cn_hint": "它在问「天气怎么样」，答句要用 sunny、rainy、windy 这类词说天气。",
            "options_cn": [
              "今天晴朗又暖和。",
              "我喜欢夏天。",
              "我最喜欢的颜色是蓝色。",
              "我不知道。"
            ]
          },
          {
            "id": "wed-sp3",
            "sentence": "What are you going to do this summer vacation?",
            "sentence_cn": "今年暑假你打算做什么？",
            "options": [
              "I'm going to visit my grandparents in Beijing.",
              "I went to the park.",
              "I am a student.",
              "I have a book."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 going to 的连读 /ɡənə/，vacation 美音 /veɪˈkeɪʃn/，英音 /vəˈkeɪʃn/",
            "explanation_cn": "这题用 be going to 结构询问暑假计划。be going to + 动词原形表示打算做某事。注意 this summer vacation 前面不用介词 in。回答时态要对应，用 be going to 结构。",
            "explanation_en": "This question uses 'be going to' to ask about summer vacation plans. Structure: be going to + base verb means 'plan to do something'. Note: no preposition before 'this summer vacation'. The answer should match with 'be going to' structure.",
            "answer_cn_hint": "它在问「打算做什么」，答句要说将来的计划，用 be going to 或 will。",
            "options_cn": [
              "我打算去北京看望爷爷奶奶。",
              "我去了公园。",
              "我是一名学生。",
              "我有一本书。"
            ]
          },
          {
            "id": "wed-sp4",
            "sentence": "Can you describe your best friend?",
            "sentence_cn": "你能描述一下你最好的朋友吗？",
            "options": [
              "Sure! She is tall and kind. She has long hair and always helps others.",
              "I have a dog.",
              "My friend is at home.",
              "I don't like her."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 describe 的重音在第二音节 /dɪˈskraɪb/；tall 和 kind 之间稍作停顿",
            "explanation_cn": "这是描述人物的题。回答应包括外貌特征（tall, short, thin 等）和性格特点（kind, funny, smart 等）。常用句型：She/He is + 形容词. She/He has + 特征. describe 是动词，名词形式是 description。",
            "explanation_en": "This is a person description question. Your answer should include physical appearance (tall, short, thin, etc.) and personality traits (kind, funny, smart, etc.). Common patterns: She/He is + adjective. She/He has + feature. 'Describe' is a verb; its noun form is 'description'.",
            "answer_cn_hint": "这是在请你说说好朋友长什么样、人怎么样，答句要有外貌或者性格。",
            "options_cn": [
              "当然！她又高又善良，留着长头发，总是帮助别人。",
              "我有一只狗。",
              "我的朋友在家。",
              "我不喜欢她。"
            ]
          },
          {
            "id": "wed-sp5",
            "sentence": "What's your favorite food? Why?",
            "sentence_cn": "你最喜欢的食物是什么？为什么？",
            "options": [
              "My favorite food is dumplings because they are delicious.",
              "I am hungry.",
              "I eat lunch at school.",
              "Food is important."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 dumplings 的 /dʌm/ 音，delicious 重音在第二音节 /dɪˈlɪʃəs/，注意 ci 发 /ʃ/",
            "explanation_cn": "这题询问喜欢的食物及原因。回答格式：My favorite food is + 食物 + because + 原因。常用原因词：delicious（美味的）, healthy（健康的）, sweet（甜的）。注意 food 不可数，但具体食物名称如 dumplings 可数。",
            "explanation_en": "This question asks about favorite food and the reason. Answer format: My favorite food is + food + because + reason. Common reason words: delicious, healthy, sweet. Note: 'food' is uncountable, but specific food names like 'dumplings' are countable.",
            "answer_cn_hint": "它问了两件事：最喜欢的食物 + 为什么，答句最好两样都有（…because…）。",
            "options_cn": [
              "我最喜欢的食物是饺子，因为它们很好吃。",
              "我饿了。",
              "我在学校吃午饭。",
              "食物很重要。"
            ]
          }
        ]
      },
      {
        "id": "wed-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "adventure",
            "phonetic": "/ədˈventʃə/",
            "meaning": "冒险，奇遇",
            "emoji": "🗺️",
            "example_en": "The trip was a great adventure.",
            "example_cn": "这次旅行是一次大冒险。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🐌",
                  "🎉",
                  "🗺️",
                  "🔥"
                ],
                "answer": 2
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🐰",
                  "😭",
                  "🗺️",
                  "📚"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "adventure 是什么意思？（1/2）",
                "options": [
                  "冒险，奇遇",
                  "保护",
                  "探索",
                  "成功"
                ],
                "answer": 0
              },
              {
                "type": "meaning_choice",
                "prompt": "adventure 是什么意思？（2/2）",
                "options": [
                  "成功",
                  "冒险，奇遇",
                  "探索",
                  "保护"
                ],
                "answer": 1
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: adv__nt__re",
                "answer": "eu"
              }
            ],
            "letters": [
              "a",
              "d",
              "v",
              "e",
              "n",
              "t",
              "u",
              "r",
              "e"
            ],
            "syllables": [
              "ad",
              "ven",
              "ture"
            ],
            "hint_cn": "去陌生的地方走一走，路上又惊又好玩"
          },
          {
            "word": "imagine",
            "phonetic": "/ɪˈmædʒɪn/",
            "meaning": "想象",
            "emoji": "💭",
            "example_en": "I imagine flying in the sky.",
            "example_cn": "我想象在天空中飞翔。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🏃",
                  "🐌",
                  "🛋️",
                  "💭"
                ],
                "answer": 3
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🐌",
                  "🍔",
                  "🎉",
                  "💭"
                ],
                "answer": 3
              },
              {
                "type": "meaning_choice",
                "prompt": "imagine 是什么意思？（1/2）",
                "options": [
                  "成功",
                  "想象",
                  "探索",
                  "冒险，奇遇"
                ],
                "answer": 1
              },
              {
                "type": "meaning_choice",
                "prompt": "imagine 是什么意思？（2/2）",
                "options": [
                  "冒险，奇遇",
                  "探索",
                  "保护",
                  "想象"
                ],
                "answer": 3
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: im__g__ne",
                "answer": "ai"
              }
            ],
            "letters": [
              "i",
              "m",
              "a",
              "g",
              "i",
              "n",
              "e"
            ],
            "syllables": [
              "i",
              "ma",
              "gine"
            ],
            "hint_cn": "闭上眼睛，在脑子里“看见”从来没去过的地方"
          },
          {
            "word": "protect",
            "phonetic": "/prəˈtekt/",
            "meaning": "保护",
            "emoji": "🛡️",
            "example_en": "We should protect the environment.",
            "example_cn": "我们应该保护环境。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "⚽",
                  "🛋️",
                  "😭",
                  "🛡️"
                ],
                "answer": 3
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "📉",
                  "🎸",
                  "🛡️",
                  "📈"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "protect 是什么意思？（1/2）",
                "options": [
                  "成功",
                  "想象",
                  "冒险，奇遇",
                  "保护"
                ],
                "answer": 3
              },
              {
                "type": "meaning_choice",
                "prompt": "protect 是什么意思？（2/2）",
                "options": [
                  "保护",
                  "冒险，奇遇",
                  "探索",
                  "想象"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: pr__t__ct",
                "answer": "oe"
              }
            ],
            "letters": [
              "p",
              "r",
              "o",
              "t",
              "e",
              "c",
              "t"
            ],
            "syllables": [
              "pro",
              "tect"
            ],
            "hint_cn": "挡在前面，不让它受伤害"
          },
          {
            "word": "success",
            "phonetic": "/səkˈses/",
            "meaning": "成功",
            "emoji": "🏆",
            "example_en": "Hard work leads to success.",
            "example_cn": "努力工作带来成功。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🏆",
                  "🌧️",
                  "🌸",
                  "🔥"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "😈",
                  "🤝",
                  "🏃",
                  "🏆"
                ],
                "answer": 3
              },
              {
                "type": "meaning_choice",
                "prompt": "success 是什么意思？（1/2）",
                "options": [
                  "成功",
                  "探索",
                  "冒险，奇遇",
                  "想象"
                ],
                "answer": 0
              },
              {
                "type": "meaning_choice",
                "prompt": "success 是什么意思？（2/2）",
                "options": [
                  "想象",
                  "探索",
                  "保护",
                  "成功"
                ],
                "answer": 3
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: su__c__ss",
                "answer": "ce"
              }
            ],
            "letters": [
              "s",
              "u",
              "c",
              "c",
              "e",
              "s",
              "s"
            ],
            "syllables": [
              "suc",
              "cess"
            ],
            "hint_cn": "努力以后，事情办成了"
          },
          {
            "word": "explore",
            "phonetic": "/ɪkˈsplɔː/",
            "meaning": "探索",
            "emoji": "🧭",
            "example_en": "Let's explore the forest.",
            "example_cn": "让我们探索森林。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🛋️",
                  "🔥",
                  "🤝",
                  "🧭"
                ],
                "answer": 3
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "😈",
                  "🐰",
                  "🐌",
                  "🧭"
                ],
                "answer": 3
              },
              {
                "type": "meaning_choice",
                "prompt": "explore 是什么意思？（1/2）",
                "options": [
                  "保护",
                  "成功",
                  "想象",
                  "探索"
                ],
                "answer": 3
              },
              {
                "type": "meaning_choice",
                "prompt": "explore 是什么意思？（2/2）",
                "options": [
                  "保护",
                  "冒险，奇遇",
                  "探索",
                  "成功"
                ],
                "answer": 2
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: ex__l__re",
                "answer": "po"
              }
            ],
            "letters": [
              "e",
              "x",
              "p",
              "l",
              "o",
              "r",
              "e"
            ],
            "syllables": [
              "ex",
              "plore"
            ],
            "hint_cn": "走进没去过的地方，看看里面到底有什么"
          }
        ]
      },
      {
        "id": "wed-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "Giant pandas are one of the most loved animals in China. They have black and white fur and look very cute. Pandas live in the bamboo forests of Sichuan. A baby panda is very, very small. It is only about 100 grams at birth, lighter than a cup of water. Now there are panda bases in Sichuan, and scientists there help baby pandas grow up well.",
        "passage_cn": "大熊猫是中国最受喜爱的动物之一。它们长着黑白相间的毛，看起来非常可爱。大熊猫生活在四川的竹林里。熊猫宝宝非常非常小。出生时只有大约100克，比一杯水还轻。现在四川建有大熊猫基地，那里的科学家帮助熊猫宝宝健康成长。",
        "questions": [
          {
            "id": "wed-rd1",
            "type": "choice",
            "question": "What colour is a panda's fur?",
            "options": [
              "Black and white",
              "All white",
              "Brown and yellow",
              "All black"
            ],
            "answer": 0,
            "explanation_cn": "第一段：black and white fur（黑白相间的毛）。"
          },
          {
            "id": "wed-rd2",
            "type": "choice",
            "question": "Where do pandas live?",
            "options": [
              "In the bamboo forests of Sichuan",
              "In the deserts",
              "Near the sea",
              "In big cities"
            ],
            "answer": 0,
            "explanation_cn": "第二句：pandas live in the bamboo forests of Sichuan（四川竹林）。"
          },
          {
            "id": "wed-rd4",
            "type": "choice",
            "question": "How heavy is a baby panda at birth?",
            "options": [
              "About 100 grams",
              "About 1 kilogram",
              "About 10 kilograms",
              "About 100 kilograms"
            ],
            "answer": 0,
            "explanation_cn": "出生时只有约 100 克，比一杯水还轻。"
          },
          {
            "id": "wed-rd6",
            "type": "choice",
            "question": "Who helps baby pandas grow up well?",
            "options": [
              "Scientists in the panda bases",
              "Farmers in the north",
              "Teachers at school",
              "Doctors in hospitals"
            ],
            "answer": 0,
            "explanation_cn": "熊猫基地的科学家帮助熊猫宝宝长大。"
          }
        ]
      },
      {
        "id": "wed-mc",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 5,
        "questions": [
          {
            "id": "wed-mc1",
            "type": "choice",
            "question": "The panda ___ black and white fur.",
            "options": [
              "has",
              "have",
              "having",
              "is have"
            ],
            "answer": 0,
            "explanation_cn": "主语 the panda 是第三人称单数，动词用 has。"
          },
          {
            "id": "wed-mc2",
            "type": "choice",
            "question": "Pandas live ___ the bamboo forests of Sichuan.",
            "options": [
              "in",
              "on",
              "under",
              "at"
            ],
            "answer": 0,
            "explanation_cn": "「在竹林里」用 in the bamboo forests。"
          },
          {
            "id": "wed-mc3",
            "type": "choice",
            "question": "A baby panda is only about 100 grams at ___.",
            "options": [
              "birth",
              "school",
              "lunch",
              "work"
            ],
            "answer": 0,
            "explanation_cn": "「出生时」说 at birth，是固定搭配。"
          },
          {
            "id": "wed-mc4",
            "type": "choice",
            "question": "Pandas spend most of their day ___ bamboo.",
            "options": [
              "eating",
              "eat",
              "ate",
              "eats"
            ],
            "answer": 0,
            "explanation_cn": "spend time doing sth：spend 后面动词用 -ing 形式。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周四",
    "day_en": "Thursday",
    "is_speaking_day": false,
    "total_duration": 30,
    "theme_cn": "听力练习 + 完形填空 + 时态练习",
    "modules": [
      {
        "id": "thu-listening",
        "name_cn": "听力练习",
        "type": "listening",
        "duration": 10,
        "questions": [
          {
            "id": "thu-ls1",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "The Great Wall is in the north of China.",
            "options": [
              "The Great Wall is in the north of China.",
              "The Great Wall is in the south of China.",
              "The Great Wall is in the east of China.",
              "The Great Wall is in the west of China."
            ],
            "answer": 0,
            "explanation_cn": "听到的是 north（北方），注意区分 north / south / east / west。"
          },
          {
            "id": "thu-ls2",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "It is more than 20000 kilometres long.",
            "options": [
              "It is more than 20000 kilometres long.",
              "It is more than 2000 kilometres long.",
              "It is more than 200 kilometres long.",
              "It is less than 20000 kilometres long."
            ],
            "answer": 0,
            "explanation_cn": "数字题：20000（两万），别听成 2000 或 200；注意 more than 和 less than。"
          },
          {
            "id": "thu-ls3",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "People started to build it over 2000 years ago.",
            "options": [
              "People started to build it over 2000 years ago.",
              "People started to build it over 200 years ago.",
              "People stopped building it 2000 years ago.",
              "People finished building it last year."
            ],
            "answer": 0,
            "explanation_cn": "started（开始）和 stopped（停止）发音相近要分清；数字是 2000 多年前。"
          },
          {
            "id": "thu-ls4",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Soldiers stood on the wall and watched for enemies.",
            "options": [
              "Soldiers stood on the wall and watched for enemies.",
              "Soldiers played on the wall and sang songs.",
              "Soldiers slept on the wall at night.",
              "Soldiers cooked dinner on the wall."
            ],
            "answer": 0,
            "explanation_cn": "关键词 stood（站立）和 watched（瞭望），别听成 played 或 slept。"
          },
          {
            "id": "thu-ls5",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Many visitors come to climb the Great Wall every year.",
            "options": [
              "Many visitors come to climb the Great Wall every year.",
              "Many visitors come to climb the mountain every week.",
              "Many students come to clean the Great Wall.",
              "Few visitors come to the Great Wall."
            ],
            "answer": 0,
            "explanation_cn": "主语是 visitors（游客），动词是 climb（爬），时间是 every year。"
          }
        ]
      },
      {
        "id": "thu-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "China is the home 1___ tea. People in China started to drink tea long, long ago. In the past, people 2___ tea leaves to many countries along the old roads. There are many 3___ of tea in China, like green tea and black tea. Green tea is 4___ in Hangzhou and other warm places. When guests come to a Chinese home, the host always 5___ them a cup of tea. Next time you visit a Chinese family, remember to 6___ the tea.",
        "questions": [
          {
            "id": "thu-cz1",
            "type": "choice",
            "question": "1___",
            "options": [
              "of",
              "to",
              "at",
              "in"
            ],
            "answer": 0,
            "explanation_cn": "the home of tea：茶的故乡，of 表示所属。"
          },
          {
            "id": "thu-cz2",
            "type": "choice",
            "question": "2___",
            "options": [
              "carried",
              "drank",
              "ate",
              "drew"
            ],
            "answer": 0,
            "explanation_cn": "把茶叶「运」到别的国家用 carried（carry 的过去式）。"
          },
          {
            "id": "thu-cz3",
            "type": "choice",
            "question": "3___",
            "options": [
              "kinds",
              "pieces",
              "boxes",
              "glasses"
            ],
            "answer": 0,
            "explanation_cn": "many kinds of tea：许多种茶，kinds 意思是「种类」。"
          },
          {
            "id": "thu-cz4",
            "type": "choice",
            "question": "4___",
            "options": [
              "grown",
              "eaten",
              "drawn",
              "thrown"
            ],
            "answer": 0,
            "explanation_cn": "茶「种植」在杭州等温暖的地方，用 grown（grow 的过去分词）。"
          },
          {
            "id": "thu-cz5",
            "type": "choice",
            "question": "5___",
            "options": [
              "gives",
              "give",
              "giving",
              "gave"
            ],
            "answer": 0,
            "explanation_cn": "主语 the host 是第三人称单数，一般现在时动词加 s：gives。"
          },
          {
            "id": "thu-cz6",
            "type": "choice",
            "question": "6___",
            "options": [
              "enjoy",
              "throw",
              "forget",
              "leave"
            ],
            "answer": 0,
            "explanation_cn": "remember to do sth：记得去享受这杯茶，用 enjoy。"
          }
        ]
      },
      {
        "id": "thu-tense",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 10,
        "questions": [
          {
            "id": "thu-tn1",
            "type": "fill",
            "question": "I ___ (drink) a cup of green tea yesterday. [填入正确形式]",
            "answer": "drank",
            "explanation_cn": "yesterday 是过去时间标志，drink 的过去式是 drank（不规则变化）。"
          },
          {
            "id": "thu-tn2",
            "type": "fill",
            "question": "China ___ (be) the home of tea for thousands of years. [填入正确形式]",
            "answer": "has been",
            "explanation_cn": "for thousands of years 表示延续到现在，用现在完成时 has been。"
          },
          {
            "id": "thu-tn3",
            "type": "fill",
            "question": "Look! The old man ___ (make) tea in the garden. [填入正确形式]",
            "answer": "is making",
            "explanation_cn": "Look! 提示动作正在进行，用现在进行时 is making。"
          },
          {
            "id": "thu-tn4",
            "type": "fill",
            "question": "My grandpa often ___ (tell) me stories about the Tea Road. [填入正确形式]",
            "answer": "tells",
            "explanation_cn": "often 表示经常，主语是三单，动词用 tells。"
          },
          {
            "id": "thu-tn5",
            "type": "fill",
            "question": "People ___ (start) to grow tea in China long ago. [填入正确形式]",
            "answer": "started",
            "explanation_cn": "long ago 是过去时间，用过去式 started。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周五",
    "day_en": "Friday",
    "is_speaking_day": false,
    "total_duration": 40,
    "theme_cn": "模板写作 + KET/PET题型 + 语法复习",
    "modules": [
      {
        "id": "fri-writing",
        "name_cn": "写作练习",
        "type": "writing_template",
        "duration": 15,
        "title": "Making Dumplings",
        "requirement_cn": "请根据关键词提示完成作文，完成后请背诵全文。明天将进行挖空默写测试！",
        "keywords": [
          "dumplings",
          "wash the vegetables",
          "make the filling",
          "wrap the dumplings",
          "delicious"
        ],
        "keywords_cn": [
          "饺子",
          "洗菜",
          "调馅",
          "包饺子",
          "美味的"
        ],
        "template": "My family often makes {{1}} on winter weekends. First, we {{2}}. Then we {{3}} together. After that, we sit around the table and {{4}}. The dumplings taste very {{5}}.",
        "blanks": [
          {
            "id": 1,
            "hint_cn": "饺子",
            "hint_en": "dumplings",
            "answer": "dumplings"
          },
          {
            "id": 2,
            "hint_cn": "洗菜",
            "hint_en": "wash the vegetables",
            "answer": "wash the vegetables"
          },
          {
            "id": 3,
            "hint_cn": "调馅",
            "hint_en": "make the filling",
            "answer": "make the filling"
          },
          {
            "id": 4,
            "hint_cn": "包饺子",
            "hint_en": "wrap the dumplings",
            "answer": "wrap the dumplings"
          },
          {
            "id": 5,
            "hint_cn": "美味的",
            "hint_en": "delicious",
            "answer": "delicious"
          }
        ],
        "full_text": "My family often makes dumplings on winter weekends. First, we wash the vegetables. Then we make the filling together. After that, we sit around the table and wrap the dumplings. The dumplings taste very delicious.",
        "full_text_cn": "我家常常在冬天的周末包饺子。首先，我们洗菜。然后我们一起调馅。之后，我们围着桌子包饺子。饺子尝起来非常美味。",
        "explanation_cn": "这篇作文按「先…然后…之后」的顺序写包饺子的过程。注意：1) make dumplings 固定搭配；2) wash the vegetables 洗菜；3) make the filling 调馅；4) wrap the dumplings 包饺子；5) taste + 形容词，尝起来…。全文用一般现在时描写经常做的事。",
        "explanation_en": "This essay is about a best friend, using 5 keywords. Notes: 1) 'best friend' is a fixed collocation; 2) 'tall and kind' uses 'and' to connect two adjectives; 3) 'together' is an adverb in 'play together'; 4) 'help each other' means mutual assistance; 5) 'when' introduces a time clause. The entire essay uses the simple present tense to express a routine state."
      },
      {
        "id": "fri-ket",
        "name_cn": "KET/PET题型",
        "type": "ket_pet",
        "duration": 12,
        "questions": [
          {
            "id": "fri-kp1",
            "type": "choice",
            "question": "KET: — Would you like some tea? — ___",
            "options": [
              "Yes, please.",
              "Yes, I would like.",
              "No, I am.",
              "Yes, I do."
            ],
            "answer": 0,
            "explanation_cn": "Would you like…? 的肯定回答用 Yes, please（好的，麻烦了）。"
          },
          {
            "id": "fri-kp2",
            "type": "choice",
            "question": "KET: — ___ do you drink tea? — Every day.",
            "options": [
              "How often",
              "How long",
              "How many",
              "How much"
            ],
            "answer": 0,
            "explanation_cn": "答句是 every day（频率），问 How often（多久一次）。"
          },
          {
            "id": "fri-kp3",
            "type": "choice",
            "question": "KET: The tea smells ___. Let's have a cup.",
            "options": [
              "good",
              "well",
              "better than",
              "best"
            ],
            "answer": 0,
            "explanation_cn": "smell 是系动词，后面用形容词 good（闻起来很香）。"
          },
          {
            "id": "fri-kp4",
            "type": "choice",
            "question": "KET: — Where is the tea grown? — It ___ in warm places.",
            "options": [
              "is grown",
              "grows up",
              "grew",
              "growing"
            ],
            "answer": 0,
            "explanation_cn": "茶是被种植的，用被动语态 is grown。"
          },
          {
            "id": "fri-kp5",
            "type": "choice",
            "question": "KET: There isn't ___ tea left in the pot.",
            "options": [
              "any",
              "some",
              "many",
              "a"
            ],
            "answer": 0,
            "explanation_cn": "否定句里用 any，不用 some。"
          },
          {
            "id": "fri-kp6",
            "type": "choice",
            "question": "KET: — ___ cups of tea do you want? — Two, please.",
            "options": [
              "How many",
              "How much",
              "How long",
              "How often"
            ],
            "answer": 0,
            "explanation_cn": "cups 是可数复数，问数量用 How many。"
          },
          {
            "id": "fri-kp7",
            "type": "choice",
            "question": "KET: My grandma enjoys ___ tea with her friends.",
            "options": [
              "drinking",
              "to drink",
              "drink",
              "drinks"
            ],
            "answer": 0,
            "explanation_cn": "enjoy 后面接动名词 drinking。"
          },
          {
            "id": "fri-kp8",
            "type": "choice",
            "question": "KET: — Did you like the green tea? — Yes, ___.",
            "options": [
              "I did",
              "I do",
              "I liked",
              "I was"
            ],
            "answer": 0,
            "explanation_cn": "Did 开头的一般过去时疑问句，回答用 I did。"
          },
          {
            "id": "fri-kp9",
            "type": "choice",
            "question": "KET: Pass ___ the teapot, please.",
            "options": [
              "me",
              "I",
              "my",
              "mine"
            ],
            "answer": 0,
            "explanation_cn": "动词 pass 后面用宾格 me。"
          },
          {
            "id": "fri-kp10",
            "type": "choice",
            "question": "KET: The Tea Road is ___ old road between China and other countries.",
            "options": [
              "an",
              "a",
              "the",
              "/（不填）"
            ],
            "answer": 0,
            "explanation_cn": "old 以元音音素开头，用 an。"
          },
          {
            "id": "fri-kp11",
            "type": "choice",
            "question": "KET: — Whose cup is this? — It's ___.",
            "options": [
              "mine",
              "my",
              "me",
              "I"
            ],
            "answer": 0,
            "explanation_cn": "「我的（杯子）」用名词性物主代词 mine。"
          },
          {
            "id": "fri-kp12",
            "type": "choice",
            "question": "KET: Please ___ the door when you leave the tea house.",
            "options": [
              "close",
              "closing",
              "closed",
              "closes"
            ],
            "answer": 0,
            "explanation_cn": "祈使句用动词原形 close。"
          }
        ]
      },
      {
        "id": "fri-grammar",
        "name_cn": "语法复习",
        "type": "grammar",
        "duration": 13,
        "questions": [
          {
            "id": "fri-gr1",
            "type": "choice",
            "question": "Chinese people ___ tea for thousands of years.",
            "options": [
              "have drunk",
              "drank",
              "drink",
              "will drink"
            ],
            "answer": 0,
            "explanation_cn": "for thousands of years 表示延续到现在，用现在完成时 have drunk。"
          },
          {
            "id": "fri-gr2",
            "type": "choice",
            "question": "The host gave us two ___ of tea.",
            "options": [
              "cups",
              "cup",
              "cupes",
              "cupies"
            ],
            "answer": 0,
            "explanation_cn": "cup 是可数名词，two 后面用复数 cups；两杯茶 two cups of tea。"
          },
          {
            "id": "fri-gr3",
            "type": "choice",
            "question": "Would you like ___ sugar in your tea?",
            "options": [
              "some",
              "any",
              "many",
              "a"
            ],
            "answer": 0,
            "explanation_cn": "表示委婉邀请、希望对方回答 yes 时，疑问句也用 some。"
          },
          {
            "id": "fri-gr4",
            "type": "choice",
            "question": "This tea tastes ___. I want another cup.",
            "options": [
              "good",
              "well",
              "badly",
              "bad"
            ],
            "answer": 0,
            "explanation_cn": "taste 是系动词，后面用形容词 good。"
          },
          {
            "id": "fri-gr5",
            "type": "choice",
            "question": "Tea ___ from China to the world long ago.",
            "options": [
              "spread",
              "spreaded",
              "spreads",
              "is spread"
            ],
            "answer": 0,
            "explanation_cn": "long ago 是过去时间；spread 的过去式还是 spread。"
          },
          {
            "id": "fri-gr6",
            "type": "choice",
            "question": "My mother likes tea ___ my father likes coffee.",
            "options": [
              "while",
              "so",
              "because",
              "or"
            ],
            "answer": 0,
            "explanation_cn": "while 表示对比：妈妈喜欢茶，而爸爸喜欢咖啡。"
          },
          {
            "id": "fri-gr7",
            "type": "choice",
            "question": "Don't forget ___ the door when you leave.",
            "options": [
              "to close",
              "closing",
              "close",
              "closed"
            ],
            "answer": 0,
            "explanation_cn": "forget to do sth：忘记要去做（还没做），用 to close。"
          },
          {
            "id": "fri-gr8",
            "type": "choice",
            "question": "The tea is too hot ___ .",
            "options": [
              "to drink",
              "drink",
              "drinking",
              "drank"
            ],
            "answer": 0,
            "explanation_cn": "too…to… 结构：太烫了而不能喝。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周六",
    "day_en": "Saturday",
    "is_speaking_day": true,
    "total_duration": 50,
    "theme_cn": "AI口语 + 高频词汇 + 阅读理解",
    "modules": [
      {
        "id": "sat-speaking",
        "name_cn": "AI口语练习",
        "type": "speaking",
        "duration": 30,
        "questions": [
          {
            "id": "sat-sp1",
            "sentence": "What do you usually do on weekends?",
            "sentence_cn": "你周末通常做什么？",
            "options": [
              "I usually play basketball with my friends on weekends.",
              "I am a student.",
              "I have a cat.",
              "It is Sunday."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 weekend 的重音在第一音节 /ˈwiːkend/，usually 的 s 发 /ʒ/ 音",
            "explanation_cn": "这题询问周末活动。on weekends 意为在周末（美式），英式常用 at weekends。回答用一般现在时表示经常性活动。注意 weekend 是复合词：week + end。",
            "explanation_en": "This question asks about weekend activities. 'On weekends' is American English; British English uses 'at weekends'. Use the simple present tense for habitual activities. Note: 'weekend' is a compound word: week + end.",
            "answer_cn_hint": "它在问「周末通常做什么」，答句要说一件具体的活动，usually 表示习惯。",
            "options_cn": [
              "我周末通常和朋友们打篮球。",
              "我是一名学生。",
              "我有一只猫。",
              "今天是星期天。"
            ]
          },
          {
            "id": "sat-sp2",
            "sentence": "What's your favorite holiday? Why?",
            "sentence_cn": "你最喜欢的节日是什么？为什么？",
            "options": [
              "My favorite holiday is Spring Festival because I can get red envelopes.",
              "I like eating.",
              "Today is a holiday.",
              "I don't know."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 holiday 的发音 /ˈhɒlədeɪ/，festival 重音在第一音节 /ˈfestɪvl/",
            "explanation_cn": "这题询问最喜欢的节日。Spring Festival 是春节。red envelopes 是红包。回答格式：My favorite holiday is + 节日 + because + 原因。常见节日：Christmas, Thanksgiving, Mid-Autumn Festival。",
            "explanation_en": "This question asks about favorite holidays. 'Spring Festival' is Chinese New Year. 'Red envelopes' are monetary gifts. Answer format: My favorite holiday is + holiday + because + reason. Common holidays: Christmas, Thanksgiving, Mid-Autumn Festival.",
            "answer_cn_hint": "它问「最喜欢的节日 + 为什么」，答句要说出节日名，再说一句理由。",
            "options_cn": [
              "我最喜欢的节日是春节，因为我可以收到红包。",
              "我喜欢吃东西。",
              "今天是节日。",
              "我不知道。"
            ]
          },
          {
            "id": "sat-sp3",
            "sentence": "How do you celebrate your birthday?",
            "sentence_cn": "你怎么庆祝生日？",
            "options": [
              "I usually have a birthday party with my family and friends.",
              "I am happy.",
              "My birthday is in May.",
              "I like cake."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 celebrate 的重音在第一音节 /ˈselɪbreɪt/，birthday 中 th 发 /θ/",
            "explanation_cn": "这题询问生日庆祝方式。celebrate 意为庆祝。回答可以包括：have a party（开派对），eat birthday cake（吃蛋糕），invite friends（邀请朋友）。注意 celebrate 的拼写和重音。",
            "explanation_en": "This question asks about birthday celebration. 'Celebrate' means to mark a special occasion. Answers can include: have a party, eat birthday cake, invite friends. Note the spelling and stress of 'celebrate'.",
            "answer_cn_hint": "它在问「怎么庆祝」，答句要说生日那天的活动，不是日期。",
            "options_cn": [
              "我通常和家人朋友一起开生日聚会。",
              "我很开心。",
              "我的生日在五月。",
              "我喜欢蛋糕。"
            ]
          },
          {
            "id": "sat-sp4",
            "sentence": "What would you do if you had a million dollars?",
            "sentence_cn": "如果你有一百万美元你会做什么？",
            "options": [
              "If I had a million dollars, I would travel around the world.",
              "I have money.",
              "I like dollars.",
              "Money is important."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 million 的发音 /ˈmɪljən/，would 和 I 连读 /wʊdaɪ/，dollars 注意 /ˈdɒləz/",
            "explanation_cn": "这是虚拟语气题。If + 过去时, would + 动词原形，表示对现在的虚拟假设。注意这里 had 不是过去时而是虚拟语气用法。travel around the world 意为环游世界。",
            "explanation_en": "This is a subjunctive mood question. 'If + past tense, would + base verb' expresses a hypothetical situation about the present. Note: 'had' here is subjunctive, not past tense. 'Travel around the world' means to visit many countries globally.",
            "answer_cn_hint": "这是假设句，问「如果……你会做什么」，答句要用 If … I would … 说出你会做的事。",
            "options_cn": [
              "如果我有一百万美元，我会环游世界。",
              "我有钱。",
              "我喜欢美元。",
              "钱很重要。"
            ]
          },
          {
            "id": "sat-sp5",
            "sentence": "Describe a book you recently read.",
            "sentence_cn": "描述一本你最近读过的书。",
            "options": [
              "I recently read 'Harry Potter'. It's about a young wizard who goes to a magic school.",
              "I don't like reading.",
              "Books are expensive.",
              "I read every day."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 recently 的发音 /ˈriːsəntli/，wizard 的 /wɪzəd/，magic 重音在第一音节",
            "explanation_cn": "这题要求描述一本书。回答应包括：书名、内容简述、个人感受。recently 意为最近，常与现在完成时或过去时搭配。wizard 意为巫师，magic school 意为魔法学校。",
            "explanation_en": "This question requires describing a book. Your answer should include: title, brief content summary, personal feelings. 'Recently' means lately and is often used with present perfect or past tense. 'Wizard' means a male magic user, 'magic school' means a school for learning magic.",
            "answer_cn_hint": "这是请你介绍一本书，答句要有书名，再说书里讲了什么。",
            "options_cn": [
              "我最近读了《哈利·波特》，讲的是一个去魔法学校上学的小巫师。",
              "我不喜欢读书。",
              "书很贵。",
              "我每天都读书。"
            ]
          }
        ]
      },
      {
        "id": "sat-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "curious",
            "phonetic": "/ˈkjʊəriəs/",
            "meaning": "好奇的",
            "emoji": "🤔",
            "example_en": "Children are curious about everything.",
            "example_cn": "孩子们对一切都很好奇。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🧳",
                  "🪨",
                  "🤔",
                  "⛰️"
                ],
                "answer": 2
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🪨",
                  "🤔",
                  "😴",
                  "📚"
                ],
                "answer": 1
              },
              {
                "type": "meaning_choice",
                "prompt": "curious 是什么意思？（1/2）",
                "options": [
                  "邻居",
                  "危险的",
                  "好奇的",
                  "古老的"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "curious 是什么意思？（2/2）",
                "options": [
                  "危险的",
                  "邻居",
                  "好奇的",
                  "志愿者"
                ],
                "answer": 2
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: cu__i__us",
                "answer": "ro"
              }
            ],
            "letters": [
              "c",
              "u",
              "r",
              "i",
              "o",
              "u",
              "s"
            ],
            "syllables": [
              "cu",
              "rious"
            ],
            "hint_cn": "什么都想问“为什么”，总想弄个明白"
          },
          {
            "word": "ancient",
            "phonetic": "/ˈeɪnʃənt/",
            "meaning": "古老的",
            "emoji": "🏛️",
            "example_en": "We visited an ancient temple.",
            "example_cn": "我们参观了一座古老的寺庙。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🛋️",
                  "🍔",
                  "🏛️",
                  "📈"
                ],
                "answer": 2
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "📈",
                  "🏛️",
                  "🎸",
                  "🌸"
                ],
                "answer": 1
              },
              {
                "type": "meaning_choice",
                "prompt": "ancient 是什么意思？（1/2）",
                "options": [
                  "志愿者",
                  "危险的",
                  "好奇的",
                  "古老的"
                ],
                "answer": 3
              },
              {
                "type": "meaning_choice",
                "prompt": "ancient 是什么意思？（2/2）",
                "options": [
                  "古老的",
                  "危险的",
                  "邻居",
                  "志愿者"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: an__i__nt",
                "answer": "ce"
              }
            ],
            "letters": [
              "a",
              "n",
              "c",
              "i",
              "e",
              "n",
              "t"
            ],
            "syllables": [
              "an",
              "cient"
            ],
            "hint_cn": "很久很久以前留下来的，老得不得了"
          },
          {
            "word": "neighbor",
            "phonetic": "/ˈneɪbə/",
            "meaning": "邻居",
            "emoji": "🏘️",
            "example_en": "My neighbor is very friendly.",
            "example_cn": "我的邻居很友好。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🔍",
                  "⛰️",
                  "🎸",
                  "🏘️"
                ],
                "answer": 3
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🚗",
                  "🏘️",
                  "📚",
                  "📉"
                ],
                "answer": 1
              },
              {
                "type": "meaning_choice",
                "prompt": "neighbor 是什么意思？（1/2）",
                "options": [
                  "危险的",
                  "好奇的",
                  "古老的",
                  "邻居"
                ],
                "answer": 3
              },
              {
                "type": "meaning_choice",
                "prompt": "neighbor 是什么意思？（2/2）",
                "options": [
                  "古老的",
                  "邻居",
                  "志愿者",
                  "危险的"
                ],
                "answer": 1
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: ne__gh__or",
                "answer": "ib"
              }
            ],
            "letters": [
              "n",
              "e",
              "i",
              "g",
              "h",
              "b",
              "o",
              "r"
            ],
            "syllables": [
              "nei",
              "ghbor"
            ],
            "hint_cn": "住在你家隔壁的那个人"
          },
          {
            "word": "dangerous",
            "phonetic": "/ˈdeɪndʒərəs/",
            "meaning": "危险的",
            "emoji": "⚠️",
            "example_en": "It's dangerous to play on the road.",
            "example_cn": "在马路上玩很危险。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🌧️",
                  "🎉",
                  "⚠️",
                  "😴"
                ],
                "answer": 2
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🏀",
                  "🔥",
                  "⚠️",
                  "😴"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "dangerous 是什么意思？（1/2）",
                "options": [
                  "古老的",
                  "危险的",
                  "志愿者",
                  "好奇的"
                ],
                "answer": 1
              },
              {
                "type": "meaning_choice",
                "prompt": "dangerous 是什么意思？（2/2）",
                "options": [
                  "危险的",
                  "好奇的",
                  "志愿者",
                  "邻居"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: dan__er__us",
                "answer": "go"
              }
            ],
            "letters": [
              "d",
              "a",
              "n",
              "g",
              "e",
              "r",
              "o",
              "u",
              "s"
            ],
            "syllables": [
              "dan",
              "ge",
              "rous"
            ],
            "hint_cn": "碰了会受伤，要离得远一点"
          },
          {
            "word": "volunteer",
            "phonetic": "/ˌvɒlənˈtɪə/",
            "meaning": "志愿者",
            "emoji": "🤲",
            "example_en": "She works as a volunteer at the hospital.",
            "example_cn": "她在医院做志愿者。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🌸",
                  "🧳",
                  "📉",
                  "🤲"
                ],
                "answer": 3
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🔍",
                  "🤲",
                  "🚗",
                  "😈"
                ],
                "answer": 1
              },
              {
                "type": "meaning_choice",
                "prompt": "volunteer 是什么意思？（1/2）",
                "options": [
                  "好奇的",
                  "邻居",
                  "志愿者",
                  "古老的"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "volunteer 是什么意思？（2/2）",
                "options": [
                  "好奇的",
                  "志愿者",
                  "危险的",
                  "邻居"
                ],
                "answer": 1
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: vol__nt__er",
                "answer": "ue"
              }
            ],
            "letters": [
              "v",
              "o",
              "l",
              "u",
              "n",
              "t",
              "e",
              "e",
              "r"
            ],
            "syllables": [
              "vol",
              "un",
              "teer"
            ],
            "hint_cn": "不要钱也愿意去帮忙的人"
          }
        ]
      },
      {
        "id": "sat-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "The Mid-Autumn Festival is a special day for family in China. It comes in September or October, when the moon is round and bright. On that evening, the whole family sit together in the open air, watch the moon and eat mooncakes. Mooncakes are small round cakes with different fillings, like lotus seeds and red beans. People love them because the round shape means family reunion. There are also many old stories about the moon, and children enjoy listening to them under the bright moonlight.",
        "passage_cn": "中秋节是中国人团圆的特殊日子。它在九月或十月到来，那时月亮又圆又亮。那天晚上，全家人坐在户外，一起赏月、吃月饼。月饼是小小的圆饼，里面有各种馅，比如莲蓉和红豆。人们喜爱月饼，因为它圆圆的形状代表全家团圆。关于月亮还有许多古老的故事，孩子们喜欢在明亮的月光下听这些故事。",
        "questions": [
          {
            "id": "sat-rd1",
            "type": "choice",
            "question": "When is the Mid-Autumn Festival?",
            "options": [
              "In July or August",
              "In September or October",
              "In November or December",
              "In January or February"
            ],
            "answer": 1,
            "explanation_cn": "第二句：comes in September or October（九月或十月）。"
          },
          {
            "id": "sat-rd3",
            "type": "choice",
            "question": "What do people eat on the Mid-Autumn Festival?",
            "options": [
              "Noodles",
              "Zongzi",
              "Mooncakes",
              "Hamburgers"
            ],
            "answer": 2,
            "explanation_cn": "那天晚上全家人一起赏月、吃月饼（mooncakes）。"
          },
          {
            "id": "sat-rd5",
            "type": "choice",
            "question": "Why do people love mooncakes?",
            "options": [
              "The round shape means family reunion.",
              "They are very cheap.",
              "They are very big.",
              "They are made in factories."
            ],
            "answer": 0,
            "explanation_cn": "圆圆的形状代表全家团圆（family reunion）。"
          },
          {
            "id": "sat-rd10",
            "type": "choice",
            "question": "Which one is NOT talked about in the Mid-Autumn passage?",
            "options": [
              "People give lucky money that day.",
              "People watch the moon.",
              "People eat mooncakes.",
              "There are old stories about the moon."
            ],
            "answer": 0,
            "explanation_cn": "发压岁钱是春节的习俗，文章没提；其余三项都在文中。"
          }
        ]
      },
      {
        "id": "sat-mc",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 5,
        "questions": [
          {
            "id": "sat-mc1",
            "type": "choice",
            "question": "The Mid-Autumn Festival comes ___ September or October.",
            "options": [
              "in",
              "on",
              "at",
              "of"
            ],
            "answer": 0,
            "explanation_cn": "月份前面用 in：in September or October。"
          },
          {
            "id": "sat-mc2",
            "type": "choice",
            "question": "On that evening, the family sit together and ___ the moon.",
            "options": [
              "watch",
              "watches",
              "watched",
              "watching"
            ],
            "answer": 0,
            "explanation_cn": "and 连接两个动作，与 sit 并列，用动词原形 watch。"
          },
          {
            "id": "sat-mc3",
            "type": "choice",
            "question": "Mooncakes are small ___ cakes.",
            "options": [
              "round",
              "square",
              "long",
              "tall"
            ],
            "answer": 0,
            "explanation_cn": "月饼是圆圆的小饼，round 意思是「圆的」。"
          },
          {
            "id": "sat-mc4",
            "type": "choice",
            "question": "The round shape ___ family reunion.",
            "options": [
              "means",
              "mean",
              "meaning",
              "meant"
            ],
            "answer": 0,
            "explanation_cn": "主语 the round shape 是单数，动词用 means。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周日",
    "day_en": "Sunday",
    "is_speaking_day": false,
    "total_duration": 25,
    "theme_cn": "阅读理解 + 高频词汇 + 完形填空",
    "modules": [
      {
        "id": "sun-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 10,
        "words": [
          {
            "word": "knowledge",
            "phonetic": "/ˈnɒlɪdʒ/",
            "meaning": "知识",
            "emoji": "🎓",
            "example_en": "Knowledge is power.",
            "example_cn": "知识就是力量。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🎓",
                  "🚗",
                  "🎉",
                  "⛰️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "📝",
                  "😈",
                  "🎓",
                  "🦁"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "knowledge 是什么意思？（1/2）",
                "options": [
                  "天气",
                  "健康的",
                  "知识",
                  "惊讶，惊喜"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "knowledge 是什么意思？（2/2）",
                "options": [
                  "天气",
                  "机器",
                  "惊讶，惊喜",
                  "知识"
                ],
                "answer": 3
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: kno__le__ge",
                "answer": "wd"
              }
            ],
            "letters": [
              "k",
              "n",
              "o",
              "w",
              "l",
              "e",
              "d",
              "g",
              "e"
            ],
            "syllables": [
              "know",
              "ledge"
            ],
            "hint_cn": "书本和老师给你的那些“懂的东西”"
          },
          {
            "word": "healthy",
            "phonetic": "/ˈhelθi/",
            "meaning": "健康的",
            "emoji": "🥗",
            "example_en": "Eating vegetables keeps you healthy.",
            "example_cn": "吃蔬菜让你保持健康。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "😴",
                  "⛰️",
                  "😴",
                  "🥗"
                ],
                "answer": 3
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🌸",
                  "📉",
                  "🛋️",
                  "🥗"
                ],
                "answer": 3
              },
              {
                "type": "meaning_choice",
                "prompt": "healthy 是什么意思？（1/2）",
                "options": [
                  "知识",
                  "健康的",
                  "天气",
                  "机器"
                ],
                "answer": 1
              },
              {
                "type": "meaning_choice",
                "prompt": "healthy 是什么意思？（2/2）",
                "options": [
                  "机器",
                  "天气",
                  "惊讶，惊喜",
                  "健康的"
                ],
                "answer": 3
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: he__l__hy",
                "answer": "at"
              }
            ],
            "letters": [
              "h",
              "e",
              "a",
              "l",
              "t",
              "h",
              "y"
            ],
            "syllables": [
              "heal",
              "thy"
            ],
            "hint_cn": "不生病、身体棒棒的"
          },
          {
            "word": "machine",
            "phonetic": "/məˈʃiːn/",
            "meaning": "机器",
            "emoji": "⚙️",
            "example_en": "This machine makes coffee.",
            "example_cn": "这台机器可以做咖啡。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🏀",
                  "🐰",
                  "⚙️",
                  "🤝"
                ],
                "answer": 2
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "⚙️",
                  "😈",
                  "🛋️",
                  "🍔"
                ],
                "answer": 0
              },
              {
                "type": "meaning_choice",
                "prompt": "machine 是什么意思？（1/2）",
                "options": [
                  "天气",
                  "知识",
                  "惊讶，惊喜",
                  "机器"
                ],
                "answer": 3
              },
              {
                "type": "meaning_choice",
                "prompt": "machine 是什么意思？（2/2）",
                "options": [
                  "天气",
                  "惊讶，惊喜",
                  "知识",
                  "机器"
                ],
                "answer": 3
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: ma__h__ne",
                "answer": "ci"
              }
            ],
            "letters": [
              "m",
              "a",
              "c",
              "h",
              "i",
              "n",
              "e"
            ],
            "syllables": [
              "ma",
              "chine"
            ],
            "hint_cn": "通上电就能帮你干活的东西"
          },
          {
            "word": "weather",
            "phonetic": "/ˈweðə/",
            "meaning": "天气",
            "emoji": "🌤️",
            "example_en": "The weather is nice today.",
            "example_cn": "今天天气很好。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "😴",
                  "🌤️",
                  "🎸",
                  "🐛"
                ],
                "answer": 1
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🌤️",
                  "🏀",
                  "⛰️",
                  "😭"
                ],
                "answer": 0
              },
              {
                "type": "meaning_choice",
                "prompt": "weather 是什么意思？（1/2）",
                "options": [
                  "天气",
                  "健康的",
                  "知识",
                  "惊讶，惊喜"
                ],
                "answer": 0
              },
              {
                "type": "meaning_choice",
                "prompt": "weather 是什么意思？（2/2）",
                "options": [
                  "惊讶，惊喜",
                  "天气",
                  "知识",
                  "健康的"
                ],
                "answer": 1
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: we__t__er",
                "answer": "ah"
              }
            ],
            "letters": [
              "w",
              "e",
              "a",
              "t",
              "h",
              "e",
              "r"
            ],
            "syllables": [
              "wea",
              "ther"
            ],
            "hint_cn": "今天晴还是下雨，出门前要看一看"
          },
          {
            "word": "surprise",
            "phonetic": "/səˈpraɪz/",
            "meaning": "惊讶，惊喜",
            "emoji": "😲",
            "example_en": "What a surprise!",
            "example_cn": "真是一个惊喜！",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "😈",
                  "😲",
                  "🍰",
                  "🎸"
                ],
                "answer": 1
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🤝",
                  "🐌",
                  "😲",
                  "🎉"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "surprise 是什么意思？（1/2）",
                "options": [
                  "知识",
                  "惊讶，惊喜",
                  "健康的",
                  "机器"
                ],
                "answer": 1
              },
              {
                "type": "meaning_choice",
                "prompt": "surprise 是什么意思？（2/2）",
                "options": [
                  "机器",
                  "惊讶，惊喜",
                  "健康的",
                  "天气"
                ],
                "answer": 1
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: su__pr__se",
                "answer": "ri"
              }
            ],
            "letters": [
              "s",
              "u",
              "r",
              "p",
              "r",
              "i",
              "s",
              "e"
            ],
            "syllables": [
              "sur",
              "prise"
            ],
            "hint_cn": "事先一点都不知道，突然发生的开心事"
          }
        ]
      },
      {
        "id": "sun-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "Peking Opera is one of China's oldest 1___ arts. It started more than 200 years ago. The actors wear beautiful 2___ and paint their faces in different colours. A red face 3___ a good and brave man, and a white face means a bad man. Many old people love to 4___ Peking Opera on TV or in the theatre. Some children learn it 5___ school clubs. If you watch it once, you will never 6___ it.",
        "questions": [
          {
            "id": "sun-cz1",
            "type": "choice",
            "question": "1___",
            "options": [
              "folk",
              "fast",
              "funny",
              "foreign"
            ],
            "answer": 0,
            "explanation_cn": "folk art：民间艺术，京剧是中国的民间艺术。"
          },
          {
            "id": "sun-cz2",
            "type": "choice",
            "question": "2___",
            "options": [
              "clothes",
              "books",
              "cars",
              "glasses"
            ],
            "answer": 0,
            "explanation_cn": "演员穿着漂亮的戏服，用 clothes。"
          },
          {
            "id": "sun-cz3",
            "type": "choice",
            "question": "3___",
            "options": [
              "means",
              "makes",
              "takes",
              "puts"
            ],
            "answer": 0,
            "explanation_cn": "红脸「代表」好人，means 表示「意味着」。"
          },
          {
            "id": "sun-cz4",
            "type": "choice",
            "question": "4___",
            "options": [
              "watch",
              "touch",
              "draw",
              "close"
            ],
            "answer": 0,
            "explanation_cn": "在电视上「观看」京剧用 watch。"
          },
          {
            "id": "sun-cz5",
            "type": "choice",
            "question": "5___",
            "options": [
              "in",
              "on",
              "under",
              "behind"
            ],
            "answer": 0,
            "explanation_cn": "「在学校社团里」用 in school clubs。"
          },
          {
            "id": "sun-cz6",
            "type": "choice",
            "question": "6___",
            "options": [
              "forget",
              "remember",
              "miss",
              "hate"
            ],
            "answer": 0,
            "explanation_cn": "看过一次就不会「忘记」，never forget。"
          }
        ]
      },
      {
        "id": "sun-listening",
        "name_cn": "听力练习",
        "type": "listening",
        "duration": 5,
        "questions": [
          {
            "id": "sun-ls1",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Peking Opera is one of China's oldest folk arts.",
            "options": [
              "Peking Opera is one of China's oldest folk arts.",
              "Peking Opera is one of China's newest folk arts.",
              "Peking Opera is one of China's oldest folk dances.",
              "Beijing duck is one of China's oldest folk arts."
            ],
            "answer": 0,
            "explanation_cn": "关键词 oldest（最古老的）和 folk arts（民间艺术）。"
          },
          {
            "id": "sun-ls2",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "The actors paint their faces in different colours.",
            "options": [
              "The actors paint their faces in different colours.",
              "The actors wear their hats in different colours.",
              "The actors paint their houses in different colours.",
              "The actors dance in different colours."
            ],
            "answer": 0,
            "explanation_cn": "paint their faces（画脸），不是 hats 或 houses。"
          },
          {
            "id": "sun-ls3",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "A red face means a good and brave man.",
            "options": [
              "A red face means a good and brave man.",
              "A white face means a good and brave man.",
              "A red face means a bad and silly man.",
              "A black face means a good and brave man."
            ],
            "answer": 0,
            "explanation_cn": "red face（红脸）代表好人，white face 代表坏人。"
          },
          {
            "id": "sun-ls4",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Many old people love to watch Peking Opera.",
            "options": [
              "Many old people love to watch Peking Opera.",
              "Many young people love to watch Peking Opera.",
              "Many old people hate to watch Peking Opera.",
              "Many children love to draw Peking Opera."
            ],
            "answer": 0,
            "explanation_cn": "主语是 old people（老人），动词是 love to watch。"
          },
          {
            "id": "sun-ls5",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "It is an important part of Chinese culture.",
            "options": [
              "It is an important part of Chinese culture.",
              "It is an important part of American culture.",
              "It is an impossible part of Chinese culture.",
              "It is an important picture of Chinese culture."
            ],
            "answer": 0,
            "explanation_cn": "关键词 important part（重要部分）和 Chinese culture（中国文化）。"
          }
        ]
      }
    ]
  }
];

const WEEK2 = [
  {
    "day_cn": "周一",
    "day_en": "Monday",
    "is_speaking_day": true,
    "total_duration": 50,
    "theme_cn": "AI口语 + 高频词汇 + 阅读理解",
    "modules": [
      {
        "id": "w2-mon-speaking",
        "name_cn": "AI口语练习",
        "type": "speaking",
        "duration": 30,
        "questions": [
          {
            "id": "w2-mon-sp1",
            "sentence": "What time do you get up on school days?",
            "sentence_cn": "上学日你几点起床？",
            "options": [
              "I get up at six thirty on school days.",
              "I go to bed at six thirty.",
              "My school starts at eight o'clock.",
              "I had lunch at twelve."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 thirty /ˈθɜːti/ 的咬舌音 θ，six thirty 连读时 d 音轻过渡",
            "explanation_cn": "询问时间用 What time。回答用 I get up at + 时间。注意 get up 意为起床，at 用在具体时间点前面。",
            "explanation_en": "Use 'What time' to ask about the clock. Answer with 'I get up at + time'. Note: 'get up' means to rise from bed, and 'at' goes before a specific time.",
            "answer_cn_hint": "它在问「几点起床」，答句要有具体时间，而且必须是起床这件事。",
            "options_cn": [
              "上学日我六点半起床。",
              "我六点半睡觉。",
              "我八点开始上课。",
              "我十二点吃了午饭。"
            ]
          },
          {
            "id": "w2-mon-sp2",
            "sentence": "What's your favorite food?",
            "sentence_cn": "你最喜欢的食物是什么？",
            "options": [
              "My favorite food is noodles.",
              "My favorite color is blue.",
              "My favorite subject is art.",
              "I am watching TV now."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 noodles /ˈnuːdlz/ 的长元音 uː，词尾 s 不要漏读",
            "explanation_cn": "favorite 意为最喜欢的，问食物答食物。B 和 C 答非所问（颜色、科目），D 时态不对。注意 My favorite food is... 是常用句型。",
            "explanation_en": "'Favorite' means most liked. The question asks about food, so answer with a food. B and C answer different questions (color, subject); D uses the wrong tense. Pattern: 'My favorite food is...'",
            "answer_cn_hint": "它在问「最喜欢的食物」，答句要说食物名，不要答颜色或者科目。",
            "options_cn": [
              "我最喜欢的食物是面条。",
              "我最喜欢的颜色是蓝色。",
              "我最喜欢的科目是美术。",
              "我现在在看电视。"
            ]
          },
          {
            "id": "w2-mon-sp3",
            "sentence": "What do you usually do after school?",
            "sentence_cn": "放学后你通常做什么？",
            "options": [
              "I usually do my homework first.",
              "I am doing my homework now.",
              "I did my homework yesterday.",
              "I will go to school tomorrow."
            ],
            "answer": 0,
            "pronunciation_tips": "usually /ˈjuːʒuəli/ 注意中间的 ʒ 音，不要读成 usually 中的 j 音",
            "explanation_cn": "usually 是频度副词，表示经常性习惯，用一般现在时。A 正确；B 是现在进行时（正在做）；C 是过去时；D 答非所问。",
            "explanation_en": "'Usually' is an adverb of frequency, so the simple present tense is used. A is correct; B is present continuous, C is past tense, and D does not answer the question.",
            "answer_cn_hint": "它在问「通常做什么」（习惯），答句要用一般现在时，不能答\"正在做\"或\"昨天做\"。",
            "options_cn": [
              "我通常先做作业。",
              "我现在正在做作业。",
              "我昨天做了作业。",
              "我明天要去上学。"
            ]
          },
          {
            "id": "w2-mon-sp4",
            "sentence": "What's the weather like today?",
            "sentence_cn": "今天天气怎么样？",
            "options": [
              "It is sunny and warm today.",
              "It was rainy yesterday.",
              "It is my sister's birthday today.",
              "There are seven days in a week."
            ],
            "answer": 0,
            "pronunciation_tips": "weather /ˈweðə/ 注意 th 读 /ð/ 不是 /θ/，sunny /ˈsʌni/ 双写 n",
            "explanation_cn": "问天气的固定句型是 What's the weather like? 回答用 It is + 天气形容词。B 时态是过去，C、D 答非所问。",
            "explanation_en": "The fixed pattern for asking about weather is 'What's the weather like?' Answer with 'It is + weather adjective'. B uses past tense; C and D do not answer the question.",
            "answer_cn_hint": "它在问「今天」的天气，答句要说今天，不能答昨天。",
            "options_cn": [
              "今天晴朗又暖和。",
              "昨天下雨了。",
              "今天是我妹妹的生日。",
              "一个星期有七天。"
            ]
          },
          {
            "id": "w2-mon-sp5",
            "sentence": "How do you help at home?",
            "sentence_cn": "你在家里怎么帮忙做家务？",
            "options": [
              "I often wash the dishes after dinner.",
              "My mother cooks dinner for us.",
              "The kitchen is very clean.",
              "Dinner is ready at six."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 wash /wɒʃ/ 的 ʃ 音，dishes 词尾 -es 读 /ɪz/",
            "explanation_cn": "问你怎么帮忙，回答要说自己做的事。A 我常洗碗，正确；B 说的是妈妈；C、D 都不是回答做家务。",
            "explanation_en": "The question asks what YOU do, so the answer must be your own action. A (I often wash the dishes) is correct; B talks about mother; C and D do not answer the question.",
            "answer_cn_hint": "它问的是「你」怎么帮忙，答句的主语要是 I，不能答别人做家务。",
            "options_cn": [
              "我常常在晚饭后洗碗。",
              "我妈妈给我们做晚饭。",
              "厨房很干净。",
              "晚饭六点做好。"
            ]
          }
        ]
      },
      {
        "id": "w2-mon-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "breakfast",
            "phonetic": "/ˈbrekfəst/",
            "meaning": "早餐",
            "emoji": "🍳",
            "example_en": "I have breakfast at seven.",
            "example_cn": "我七点吃早餐。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🍳",
                  "⭐",
                  "🚗",
                  "⚽"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "⚽",
                  "⭐",
                  "🍳",
                  "🚗"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "breakfast 是什么意思？（1/2）",
                "options": [
                  "美味的",
                  "蔬菜",
                  "早餐",
                  "雨伞"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "breakfast 是什么意思？（2/2）",
                "options": [
                  "早餐",
                  "雨伞",
                  "美味的",
                  "蔬菜"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: br__kfast",
                "answer": "ea"
              }
            ],
            "letters": [
              "b",
              "r",
              "e",
              "a",
              "k",
              "f",
              "a",
              "s",
              "t"
            ],
            "syllables": [
              "break",
              "fast"
            ],
            "hint_cn": "早上刚起来吃的那一顿"
          },
          {
            "word": "delicious",
            "phonetic": "/dɪˈlɪʃəs/",
            "meaning": "美味的",
            "emoji": "😋",
            "example_en": "The noodles are delicious.",
            "example_cn": "这面条很好吃。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "😋",
                  "⭐",
                  "🚲",
                  "🌧️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🌧️",
                  "⭐",
                  "😋",
                  "🚲"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "delicious 是什么意思？（1/2）",
                "options": [
                  "早餐",
                  "蔬菜",
                  "美味的",
                  "雨伞"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "delicious 是什么意思？（2/2）",
                "options": [
                  "美味的",
                  "雨伞",
                  "早餐",
                  "蔬菜"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: deli__ous",
                "answer": "ci"
              }
            ],
            "letters": [
              "d",
              "e",
              "l",
              "i",
              "c",
              "i",
              "o",
              "u",
              "s"
            ],
            "syllables": [
              "de",
              "li",
              "cious"
            ],
            "hint_cn": "吃一口就忍不住想再吃一口"
          },
          {
            "word": "vegetable",
            "phonetic": "/ˈvedʒtəbl/",
            "meaning": "蔬菜",
            "emoji": "🥕",
            "example_en": "Eat more vegetables every day.",
            "example_cn": "每天多吃蔬菜。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🥕",
                  "⚽",
                  "🎵",
                  "🚗"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🚗",
                  "⚽",
                  "🥕",
                  "🎵"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "vegetable 是什么意思？（1/2）",
                "options": [
                  "早餐",
                  "美味的",
                  "蔬菜",
                  "雨伞"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "vegetable 是什么意思？（2/2）",
                "options": [
                  "蔬菜",
                  "雨伞",
                  "早餐",
                  "美味的"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: veg__able",
                "answer": "et"
              }
            ],
            "letters": [
              "v",
              "e",
              "g",
              "e",
              "t",
              "a",
              "b",
              "l",
              "e"
            ],
            "syllables": [
              "ve",
              "ge",
              "ta",
              "ble"
            ],
            "hint_cn": "青菜、胡萝卜那一类，吃了对身体好"
          },
          {
            "word": "umbrella",
            "phonetic": "/ʌmˈbrelə/",
            "meaning": "雨伞",
            "emoji": "☂️",
            "example_en": "Take an umbrella. It may rain.",
            "example_cn": "带上雨伞，可能会下雨。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "☂️",
                  "⭐",
                  "🎶",
                  "⚽"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "⚽",
                  "⭐",
                  "☂️",
                  "🎶"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "umbrella 是什么意思？（1/2）",
                "options": [
                  "蔬菜",
                  "美味的",
                  "雨伞",
                  "锻炼"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "umbrella 是什么意思？（2/2）",
                "options": [
                  "雨伞",
                  "锻炼",
                  "蔬菜",
                  "美味的"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: um__ella",
                "answer": "br"
              }
            ],
            "letters": [
              "u",
              "m",
              "b",
              "r",
              "e",
              "l",
              "l",
              "a"
            ],
            "syllables": [
              "um",
              "brel",
              "la"
            ],
            "hint_cn": "下雨天撑着它，就不会被淋湿"
          },
          {
            "word": "exercise",
            "phonetic": "/ˈeksəsaɪz/",
            "meaning": "锻炼；练习",
            "emoji": "🏃",
            "example_en": "Exercise makes you strong.",
            "example_cn": "锻炼让你强壮。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🏃",
                  "📖",
                  "🍎",
                  "☂️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "☂️",
                  "📖",
                  "🏃",
                  "🍎"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "exercise 是什么意思？（1/2）",
                "options": [
                  "雨伞",
                  "蔬菜",
                  "锻炼；练习",
                  "早餐"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "exercise 是什么意思？（2/2）",
                "options": [
                  "锻炼；练习",
                  "早餐",
                  "雨伞",
                  "蔬菜"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: ex__cise",
                "answer": "er"
              }
            ],
            "letters": [
              "e",
              "x",
              "e",
              "r",
              "c",
              "i",
              "s",
              "e"
            ],
            "syllables": [
              "exer",
              "cise"
            ],
            "hint_cn": "跑步、跳绳，让身体变棒"
          }
        ]
      },
      {
        "id": "w2-mon-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "China's high-speed trains are famous around the world. They run at about 350 kilometres per hour. A trip from Beijing to Shanghai takes only about four and a half hours by high-speed train. Ten years ago, the same trip took more than ten hours. The trains are clean, quiet and always on time. You can buy tickets with a mobile phone and get on the train without paper tickets.",
        "passage_cn": "中国的高铁世界闻名。它们的时速大约是350公里。坐高铁从北京到上海只需要大约四个半小时。十年前，同样的路程要花十多个小时。高铁干净、安静，而且总是准点。你可以用手机买票，不用纸质车票就能上车。",
        "questions": [
          {
            "id": "w2-mon-rd1",
            "type": "choice",
            "question": "How fast do China's high-speed trains run?",
            "options": [
              "About 350 kilometres per hour",
              "About 35 kilometres per hour",
              "About 3500 kilometres per hour",
              "About 35000 kilometres per hour"
            ],
            "answer": 0,
            "explanation_cn": "第二句：about 350 kilometres per hour（时速约350公里）。"
          },
          {
            "id": "w2-mon-rd2",
            "type": "choice",
            "question": "How long does a trip from Beijing to Shanghai take now?",
            "options": [
              "About four and a half hours",
              "About ten hours",
              "About forty minutes",
              "About one day"
            ],
            "answer": 0,
            "explanation_cn": "现在坐高铁只要大约四个半小时。"
          },
          {
            "id": "w2-mon-rd9",
            "type": "choice",
            "question": "Going by high-speed train is ___ than going by old train.",
            "options": [
              "much faster",
              "much slower",
              "a little slower",
              "the fastest"
            ],
            "answer": 0,
            "explanation_cn": "四小时半对十多小时，高铁快得多（much faster）。"
          },
          {
            "id": "w2-mon-rd10",
            "type": "choice",
            "question": "The best title for the passage about the fast trains is ___.",
            "options": [
              "China's High-speed Trains",
              "A Trip to Shanghai",
              "Trains in Old Times",
              "How to Buy Tickets"
            ],
            "answer": 0,
            "explanation_cn": "全文介绍中国高铁：速度、时间和便利。"
          }
        ]
      },
      {
        "id": "w2-mon-mc",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 5,
        "questions": [
          {
            "id": "w2-mon-mc1",
            "type": "choice",
            "question": "The high-speed train ___ at about 350 kilometres per hour.",
            "options": [
              "runs",
              "run",
              "running",
              "ran"
            ],
            "answer": 0,
            "explanation_cn": "主语 the train 三单，一般现在时用 runs。"
          },
          {
            "id": "w2-mon-mc2",
            "type": "choice",
            "question": "A trip to Shanghai ___ only four hours by high-speed train.",
            "options": [
              "takes",
              "take",
              "taking",
              "took"
            ],
            "answer": 0,
            "explanation_cn": "主语 a trip 是单数，用 takes（花费）。"
          },
          {
            "id": "w2-mon-mc3",
            "type": "choice",
            "question": "We ___ tickets with a mobile phone now.",
            "options": [
              "can buy",
              "can buys",
              "can buying",
              "can bought"
            ],
            "answer": 0,
            "explanation_cn": "情态动词 can 后面用动词原形 buy。"
          },
          {
            "id": "w2-mon-mc4",
            "type": "choice",
            "question": "The trains are clean, quiet and always ___ time.",
            "options": [
              "on",
              "in",
              "at",
              "of"
            ],
            "answer": 0,
            "explanation_cn": "on time 准时，固定搭配。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周二",
    "day_en": "Tuesday",
    "is_speaking_day": false,
    "total_duration": 30,
    "theme_cn": "阅读理解 + 语法练习 + 单项选择",
    "modules": [
      {
        "id": "w2-tue-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "The Chinese space station Tiangong is like a home in space. It flies more than 300 kilometres above the earth. Astronauts live and work there for about six months at a time. They do science experiments and even give lessons to students from space! The astronauts exercise every day, because living in space makes bones and muscles weak. They eat special space food and sleep in small sleeping bags on the wall.",
        "passage_cn": "中国空间站「天宫」就像太空里的家。它在距离地球三百多公里的高空飞行。宇航员每次在那里生活和工作大约六个月。他们做科学实验，甚至还从太空给学生上课！宇航员每天都要锻炼，因为在太空生活会让骨骼和肌肉变弱。他们吃特制的太空食品，睡在墙上的小睡袋里。",
        "questions": [
          {
            "id": "w2-tue-rd1",
            "type": "choice",
            "question": "What is Tiangong?",
            "options": [
              "The Chinese space station",
              "A high-speed train",
              "A new airport",
              "A big ship"
            ],
            "answer": 0,
            "explanation_cn": "天宫是中国空间站（space station）。"
          },
          {
            "id": "w2-tue-rd3",
            "type": "choice",
            "question": "How long do astronauts live there at a time?",
            "options": [
              "About six months",
              "About six days",
              "About six years",
              "About six weeks"
            ],
            "answer": 0,
            "explanation_cn": "宇航员每次在空间站待大约六个月。"
          },
          {
            "id": "w2-tue-rd5",
            "type": "choice",
            "question": "Why do astronauts exercise every day?",
            "options": [
              "Because space makes bones and muscles weak.",
              "Because they are bored.",
              "Because they want to lose weight.",
              "Because they sleep too much."
            ],
            "answer": 0,
            "explanation_cn": "太空生活让骨骼和肌肉变弱，所以要每天锻炼。"
          },
          {
            "id": "w2-tue-rd10",
            "type": "choice",
            "question": "The best title for the space station passage is ___.",
            "options": [
              "Life on the Tiangong Space Station",
              "How to Make Space Food",
              "A Trip to Beijing",
              "Sleeping in Space Hotels"
            ],
            "answer": 0,
            "explanation_cn": "全文围绕天宫空间站上的生活展开。"
          }
        ]
      },
      {
        "id": "w2-tue-grammar",
        "name_cn": "语法练习",
        "type": "grammar",
        "duration": 10,
        "questions": [
          {
            "id": "w2-tue-gr1",
            "type": "choice",
            "question": "Tiangong ___ around the earth every 90 minutes.",
            "options": [
              "goes",
              "go",
              "going",
              "went"
            ],
            "answer": 0,
            "explanation_cn": "主语 Tiangong 三单，一般现在时用 goes。"
          },
          {
            "id": "w2-tue-gr2",
            "type": "choice",
            "question": "The astronauts ___ to space by rocket last month.",
            "options": [
              "went",
              "go",
              "goes",
              "going"
            ],
            "answer": 0,
            "explanation_cn": "last month 过去时间，go 的过去式是 went。"
          },
          {
            "id": "w2-tue-gr3",
            "type": "choice",
            "question": "Space food ___ different from our food.",
            "options": [
              "is",
              "are",
              "am",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "主语 space food 不可数单数，用 is。"
          },
          {
            "id": "w2-tue-gr4",
            "type": "choice",
            "question": "Astronauts must keep ___ in the station.",
            "options": [
              "healthy",
              "health",
              "healthly",
              "healthful"
            ],
            "answer": 0,
            "explanation_cn": "keep + 形容词：keep healthy 保持健康。"
          },
          {
            "id": "w2-tue-gr5",
            "type": "choice",
            "question": "It is important ___ every day in space.",
            "options": [
              "to exercise",
              "exercise",
              "exercising",
              "exercised"
            ],
            "answer": 0,
            "explanation_cn": "It is important to do sth：用 to exercise。"
          },
          {
            "id": "w2-tue-gr6",
            "type": "choice",
            "question": "The station has ___ rooms for work and sleep.",
            "options": [
              "several",
              "much",
              "a little",
              "a lot"
            ],
            "answer": 0,
            "explanation_cn": "rooms 可数复数，用 several（几个）。"
          }
        ]
      },
      {
        "id": "w2-tue-choice",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 10,
        "questions": [
          {
            "id": "w2-tue-mc1",
            "type": "choice",
            "question": "Tiangong is ___ home in space for astronauts.",
            "options": [
              "like a",
              "like an",
              "likes a",
              "liking a"
            ],
            "answer": 0,
            "explanation_cn": "be like a home：像一个家。"
          },
          {
            "id": "w2-tue-mc2",
            "type": "choice",
            "question": "It flies ___ 300 kilometres above the earth.",
            "options": [
              "more than",
              "more then",
              "much than",
              "most than"
            ],
            "answer": 0,
            "explanation_cn": "more than 300 km：三百多公里。"
          },
          {
            "id": "w2-tue-mc3",
            "type": "choice",
            "question": "Astronauts ___ and work there for about six months.",
            "options": [
              "live",
              "lives",
              "living",
              "lived"
            ],
            "answer": 0,
            "explanation_cn": "and 并列 live and work，主语复数用原形。"
          },
          {
            "id": "w2-tue-mc4",
            "type": "choice",
            "question": "They do science ___ in space.",
            "options": [
              "experiments",
              "experiment",
              "experimenting",
              "experimented"
            ],
            "answer": 0,
            "explanation_cn": "do experiments 做实验，experiment 用复数。"
          },
          {
            "id": "w2-tue-mc5",
            "type": "choice",
            "question": "Astronauts exercise every day ___ space makes them weak.",
            "options": [
              "because",
              "so",
              "but",
              "or"
            ],
            "answer": 0,
            "explanation_cn": "「因为」太空让骨骼变弱，用 because。"
          },
          {
            "id": "w2-tue-mc6",
            "type": "choice",
            "question": "They sleep in small bags ___ the wall.",
            "options": [
              "on",
              "in",
              "under",
              "between"
            ],
            "answer": 0,
            "explanation_cn": "睡袋固定「在墙上」，用 on the wall。"
          },
          {
            "id": "w2-tue-mc7",
            "type": "choice",
            "question": "In 2021, astronauts ___ a science lesson from space.",
            "options": [
              "gave",
              "give",
              "gives",
              "giving"
            ],
            "answer": 0,
            "explanation_cn": "in 2021 过去时间，用过去式 gave。"
          },
          {
            "id": "w2-tue-mc8",
            "type": "choice",
            "question": "___ of students watched the lesson on TV.",
            "options": [
              "Millions",
              "Million",
              "Millions of million",
              "Two millions"
            ],
            "answer": 0,
            "explanation_cn": "Millions of + 复数名词：数百万的。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周三",
    "day_en": "Wednesday",
    "is_speaking_day": true,
    "total_duration": 50,
    "theme_cn": "AI口语 + 高频词汇 + 阅读理解",
    "modules": [
      {
        "id": "w2-wed-speaking",
        "name_cn": "AI口语练习",
        "type": "speaking",
        "duration": 30,
        "questions": [
          {
            "id": "w2-wed-sp1",
            "sentence": "Where did you go last weekend?",
            "sentence_cn": "上周末你去了哪里？",
            "options": [
              "I went to the zoo with my parents.",
              "I will go to the zoo tomorrow.",
              "I often go to the library.",
              "I am at home now."
            ],
            "answer": 0,
            "pronunciation_tips": "went 是 go 的过去式 /went/，zoo /zuː/ 长元音注意拉长",
            "explanation_cn": "last weekend 是过去时间，回答用过去式 went。B 是将来时，C 是习惯（一般现在时），D 是现在。",
            "explanation_en": "'Last weekend' is past time, so the answer uses the past form 'went'. B is future, C is a habit (simple present), D is present.",
            "answer_cn_hint": "它在问「去了哪里」（过去），答句要说一个地点，而且要用过去式。",
            "options_cn": [
              "我和爸爸妈妈去了动物园。",
              "我明天要去动物园。",
              "我常常去图书馆。",
              "我现在在家。"
            ]
          },
          {
            "id": "w2-wed-sp2",
            "sentence": "What's your favorite animal?",
            "sentence_cn": "你最喜欢的动物是什么？",
            "options": [
              "My favorite animal is the panda.",
              "My favorite fruit is the apple.",
              "I have two cats at home.",
              "Pandas live in China."
            ],
            "answer": 0,
            "pronunciation_tips": "panda /ˈpændə/ 注意 æ 发饱满，animal /ˈænɪml/ 共三个音节",
            "explanation_cn": "问最喜欢的动物，A 直接回答，正确。B 答的是水果；C、D 是事实但不是对这个问题的回答。",
            "explanation_en": "The question asks for your favorite animal. A answers directly; B answers about fruit; C and D are true facts but not answers to this question.",
            "answer_cn_hint": "它在问「最喜欢的动物」，答句要说动物名，不能答水果、颜色或者几口人。",
            "options_cn": [
              "我最喜欢的动物是熊猫。",
              "我最喜欢的水果是苹果。",
              "我家里有两只猫。",
              "熊猫生活在中国。"
            ]
          },
          {
            "id": "w2-wed-sp3",
            "sentence": "Do you like cooking?",
            "sentence_cn": "你喜欢做饭吗？",
            "options": [
              "Yes, I do. I can make eggs and pancakes.",
              "Yes, I am. I am cooking now.",
              "I cooked fish last night.",
              "Cooking takes a long time."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 Do you like 连读成 /dʒuːlaɪk/ 的自然过渡，cooking /ˈkʊkɪŋ/",
            "explanation_cn": "Do 开头的一般疑问句用 Yes, I do 回答，不能用 Yes, I am。A 正确且补充了会做的东西；C 没有回答喜不喜欢。",
            "explanation_en": "A 'Do...?' question is answered with 'Yes, I do', not 'Yes, I am'. A is correct and adds what the speaker can cook; C does not say whether the speaker likes cooking.",
            "answer_cn_hint": "这是 Do you… 问句，答句要先说 Yes, I do. 或 No, I don't.，再补一句。",
            "options_cn": [
              "是的，我喜欢。我会做鸡蛋和薄饼。",
              "是的，我是。我现在在做饭。",
              "我昨晚做了鱼。",
              "做饭要花很长时间。"
            ]
          },
          {
            "id": "w2-wed-sp4",
            "sentence": "What do you want to be when you grow up?",
            "sentence_cn": "你长大后想做什么？",
            "options": [
              "I want to be a doctor.",
              "I want to buy a doctor.",
              "I want to be a doctor's office.",
              "I am a student now."
            ],
            "answer": 0,
            "pronunciation_tips": "grow up 连读注意 /ɡrəʊ/ 的双元音要饱满，want to 口语中常读成 wanna",
            "explanation_cn": "问职业理想用 want to be + 职业。A 正确；B 用 buy（买）搭配错误；C a doctor's office 是地点；D 没回答理想职业。",
            "explanation_en": "To talk about a dream job, use 'want to be + job'. A is correct; B uses the wrong verb (buy); C is a place; D does not answer the question.",
            "answer_cn_hint": "它在问「将来做什么职业」，答句要用 I want to be a … 说出一种职业。",
            "options_cn": [
              "我想当医生。",
              "我想买一个医生。",
              "我想当医生的办公室。",
              "我现在是学生。"
            ]
          },
          {
            "id": "w2-wed-sp5",
            "sentence": "What's your favorite season?",
            "sentence_cn": "你最喜欢的季节是什么？",
            "options": [
              "My favorite season is autumn.",
              "My favorite month is May.",
              "It is autumn now.",
              "There are four seasons in a year."
            ],
            "answer": 0,
            "pronunciation_tips": "autumn /ˈɔːtəm/ 注意 n 不发音，读作 /ˈɔːtəm/",
            "explanation_cn": "问最喜欢的季节，A 正确。B 答的是月份；C 说的是现在的季节；D 是常识但不是回答。",
            "explanation_en": "The question asks for your favorite season. A answers it; B is about a month; C states the current season; D is a general fact, not an answer.",
            "answer_cn_hint": "它在问「最喜欢的季节」（春/夏/秋/冬），不要答月份。",
            "options_cn": [
              "我最喜欢的季节是秋天。",
              "我最喜欢的月份是五月。",
              "现在是秋天。",
              "一年有四个季节。"
            ]
          }
        ]
      },
      {
        "id": "w2-wed-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "panda",
            "phonetic": "/ˈpændə/",
            "meaning": "熊猫",
            "emoji": "🐼",
            "example_en": "The panda is eating bamboo.",
            "example_cn": "熊猫正在吃竹子。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🐼",
                  "⭐",
                  "🚗",
                  "⚽"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "⚽",
                  "⭐",
                  "🐼",
                  "🚗"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "panda 是什么意思？（1/2）",
                "options": [
                  "竹子",
                  "森林",
                  "熊猫",
                  "聪明的"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "panda 是什么意思？（2/2）",
                "options": [
                  "熊猫",
                  "聪明的",
                  "竹子",
                  "森林"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: p__nda",
                "answer": "a"
              }
            ],
            "letters": [
              "p",
              "a",
              "n",
              "d",
              "a"
            ],
            "syllables": [
              "pan",
              "da"
            ],
            "hint_cn": "黑白两色、胖胖的，最爱吃竹子"
          },
          {
            "word": "bamboo",
            "phonetic": "/bæmˈbuː/",
            "meaning": "竹子",
            "emoji": "🎋",
            "example_en": "Pandas love bamboo.",
            "example_cn": "熊猫喜欢竹子。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🎋",
                  "⭐",
                  "🌳",
                  "🌧️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🌧️",
                  "⭐",
                  "🎋",
                  "🌳"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "bamboo 是什么意思？（1/2）",
                "options": [
                  "熊猫",
                  "森林",
                  "竹子",
                  "友好的"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "bamboo 是什么意思？（2/2）",
                "options": [
                  "竹子",
                  "友好的",
                  "熊猫",
                  "森林"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: ba__oo",
                "answer": "mb"
              }
            ],
            "letters": [
              "b",
              "a",
              "m",
              "b",
              "o",
              "o"
            ],
            "syllables": [
              "bam",
              "boo"
            ],
            "hint_cn": "一节一节的，长得很高，熊猫最爱吃"
          },
          {
            "word": "forest",
            "phonetic": "/ˈfɒrɪst/",
            "meaning": "森林",
            "emoji": "🌲",
            "example_en": "Many animals live in the forest.",
            "example_cn": "许多动物住在森林里。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🌲",
                  "⚽",
                  "🎵",
                  "🚗"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🚗",
                  "⚽",
                  "🌲",
                  "🎵"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "forest 是什么意思？（1/2）",
                "options": [
                  "熊猫",
                  "竹子",
                  "森林",
                  "友好的"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "forest 是什么意思？（2/2）",
                "options": [
                  "森林",
                  "友好的",
                  "熊猫",
                  "竹子"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: fo__st",
                "answer": "re"
              }
            ],
            "letters": [
              "f",
              "o",
              "r",
              "e",
              "s",
              "t"
            ],
            "syllables": [
              "fo",
              "rest"
            ],
            "hint_cn": "树很多很多的地方，动物住在里面"
          },
          {
            "word": "clever",
            "phonetic": "/ˈklevə/",
            "meaning": "聪明的",
            "emoji": "💡",
            "example_en": "The fox is very clever.",
            "example_cn": "狐狸非常聪明。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "💡",
                  "⭐",
                  "🌧️",
                  "🎸"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎸",
                  "⭐",
                  "💡",
                  "🌧️"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "clever 是什么意思？（1/2）",
                "options": [
                  "森林",
                  "竹子",
                  "聪明的",
                  "友好的"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "clever 是什么意思？（2/2）",
                "options": [
                  "聪明的",
                  "友好的",
                  "森林",
                  "竹子"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: cle__er",
                "answer": "v"
              }
            ],
            "letters": [
              "c",
              "l",
              "e",
              "v",
              "e",
              "r"
            ],
            "syllables": [
              "cle",
              "ver"
            ],
            "hint_cn": "脑子转得快，一点就通"
          },
          {
            "word": "friendly",
            "phonetic": "/ˈfrendli/",
            "meaning": "友好的",
            "emoji": "🤗",
            "example_en": "My new classmate is friendly.",
            "example_cn": "我的新同学很友好。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🤗",
                  "⭐",
                  "🚲",
                  "🎲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎲",
                  "⭐",
                  "🤗",
                  "🚲"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "friendly 是什么意思？（1/2）",
                "options": [
                  "聪明的",
                  "森林",
                  "友好的",
                  "竹子"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "friendly 是什么意思？（2/2）",
                "options": [
                  "友好的",
                  "竹子",
                  "聪明的",
                  "森林"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: frien__y",
                "answer": "dl"
              }
            ],
            "letters": [
              "f",
              "r",
              "i",
              "e",
              "n",
              "d",
              "l",
              "y"
            ],
            "syllables": [
              "friend",
              "ly"
            ],
            "hint_cn": "见谁都笑眯眯，愿意和你一起玩"
          }
        ]
      },
      {
        "id": "w2-wed-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "Mobile payment has changed the way Chinese people shop. Today, most people pay for things with a mobile phone. In shops, restaurants and even street markets, you just scan a QR code and the money goes to the seller in one second. Ten years ago, people carried cash everywhere and waited for change. Now many young people don't take any cash at all. Mobile payment makes shopping faster and safer, because you don't need to carry a lot of money with you.",
        "passage_cn": "移动支付改变了中国人的购物方式。如今，大多数人用手机付款。在商店、餐馆甚至街边市场，你只需要扫一下二维码，钱一秒钟就到了卖家手里。十年前，人们到处带着现金，还要等找零。现在很多年轻人根本不带现金。移动支付让购物更快、更安全，因为你不用随身带很多钱。",
        "questions": [
          {
            "id": "w2-wed-rd1",
            "type": "choice",
            "question": "What has changed the way Chinese people shop?",
            "options": [
              "Mobile payment",
              "New buses",
              "Big shops",
              "Rainy days"
            ],
            "answer": 0,
            "explanation_cn": "第一句：移动支付改变了人们的购物方式。"
          },
          {
            "id": "w2-wed-rd3",
            "type": "choice",
            "question": "What do you scan to pay?",
            "options": [
              "A QR code",
              "A photo",
              "A book",
              "A map"
            ],
            "answer": 0,
            "explanation_cn": "扫二维码（QR code）就可以付款。"
          },
          {
            "id": "w2-wed-rd5",
            "type": "choice",
            "question": "What did people do ten years ago?",
            "options": [
              "They carried cash and waited for change.",
              "They used QR codes.",
              "They paid by phone.",
              "They had no money."
            ],
            "answer": 0,
            "explanation_cn": "十年前人们带现金还要等找零。"
          },
          {
            "id": "w2-wed-rd10",
            "type": "choice",
            "question": "The best title for the passage about paying by phone is ___.",
            "options": [
              "Mobile Payment Changes Shopping",
              "A Trip to the Bank",
              "Cash Is the Best",
              "How to Count Money"
            ],
            "answer": 0,
            "explanation_cn": "全文讲移动支付如何改变购物。"
          }
        ]
      },
      {
        "id": "w2-wed-mc",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 5,
        "questions": [
          {
            "id": "w2-wed-mc1",
            "type": "choice",
            "question": "Most people ___ for things with a mobile phone now.",
            "options": [
              "pay",
              "pays",
              "paying",
              "paid"
            ],
            "answer": 0,
            "explanation_cn": "people 作「人们」是复数，用原形 pay。"
          },
          {
            "id": "w2-wed-mc2",
            "type": "choice",
            "question": "You just need ___ a QR code to pay.",
            "options": [
              "to scan",
              "scan",
              "scanning",
              "scans"
            ],
            "answer": 0,
            "explanation_cn": "need to do sth：需要扫码，用 to scan。"
          },
          {
            "id": "w2-wed-mc3",
            "type": "choice",
            "question": "The money goes to the seller ___ one second.",
            "options": [
              "in",
              "on",
              "at",
              "for"
            ],
            "answer": 0,
            "explanation_cn": "「在一秒之内」用 in one second。"
          },
          {
            "id": "w2-wed-mc4",
            "type": "choice",
            "question": "Ten years ago, people ___ cash everywhere.",
            "options": [
              "carried",
              "carry",
              "carries",
              "carrying"
            ],
            "answer": 0,
            "explanation_cn": "ten years ago 过去时间，用过去式 carried。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周四",
    "day_en": "Thursday",
    "is_speaking_day": false,
    "total_duration": 30,
    "theme_cn": "听力练习 + 完形填空 + 时态练习",
    "modules": [
      {
        "id": "w2-thu-listening",
        "name_cn": "听力练习",
        "type": "listening",
        "duration": 10,
        "questions": [
          {
            "id": "w2-thu-ls1",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "China's high-speed trains run at about 350 kilometres per hour.",
            "options": [
              "China's high-speed trains run at about 350 kilometres per hour.",
              "China's high-speed trains run at about 3500 kilometres per hour.",
              "China's high-speed buses run at about 350 kilometres per hour.",
              "China's high-speed trains stop at 350 kilometres per hour."
            ],
            "answer": 0,
            "explanation_cn": "数字 350（三百五），注意别听成 3500；主语是 trains。"
          },
          {
            "id": "w2-thu-ls2",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "A trip from Beijing to Shanghai takes about four hours.",
            "options": [
              "A trip from Beijing to Shanghai takes about four hours.",
              "A trip from Beijing to Shanghai takes about fourteen hours.",
              "A trip from Shanghai to Beijing takes about four days.",
              "A trip from Beijing to Tianjin takes about four hours."
            ],
            "answer": 0,
            "explanation_cn": "four（4）和 fourteen（14）要分清；地点是北京到上海。"
          },
          {
            "id": "w2-thu-ls3",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "You can buy tickets with a mobile phone.",
            "options": [
              "You can buy tickets with a mobile phone.",
              "You can buy chicken with a mobile phone.",
              "You can buy tickets with paper money only.",
              "You can sell tickets with a mobile phone."
            ],
            "answer": 0,
            "explanation_cn": "buy（买）不是 sell（卖）；工具是 mobile phone。"
          },
          {
            "id": "w2-thu-ls4",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "The trains are clean, quiet and always on time.",
            "options": [
              "The trains are clean, quiet and always on time.",
              "The trains are clean, noisy and always late.",
              "The buses are clean, quiet and always on time.",
              "The trains are dirty, quiet and always on time."
            ],
            "answer": 0,
            "explanation_cn": "quiet（安静）不是 noisy（吵闹）；on time（准点）不是 late。"
          },
          {
            "id": "w2-thu-ls5",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "People from many countries come to learn from China.",
            "options": [
              "People from many countries come to learn from China.",
              "People from many countries come to teach in China.",
              "People from my country come to learn from China.",
              "People from many countries come to travel to China only."
            ],
            "answer": 0,
            "explanation_cn": "learn from China（向中国学习），不是 teach（教）。"
          }
        ]
      },
      {
        "id": "w2-thu-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "New energy cars are becoming more and more 1___ in China. They use electricity instead of petrol. They make 2___ pollution, so the air in big cities is getting 3___. The cars are also quiet. When you sit 4___ a new energy car, you can hardly hear the engine. Drivers can 5___ the cars at charging stations, just like charging a big phone. In the future, most cars on the streets will 6___ electric ones.",
        "questions": [
          {
            "id": "w2-thu-cz1",
            "type": "choice",
            "question": "1___",
            "options": [
              "popular",
              "angry",
              "salty",
              "cloudy"
            ],
            "answer": 0,
            "explanation_cn": "越来越「受欢迎」，popular。"
          },
          {
            "id": "w2-thu-cz2",
            "type": "choice",
            "question": "2___",
            "options": [
              "less",
              "more",
              "fewer",
              "little"
            ],
            "answer": 0,
            "explanation_cn": "电动车污染更「少」，用 less pollution。"
          },
          {
            "id": "w2-thu-cz3",
            "type": "choice",
            "question": "3___",
            "options": [
              "better",
              "worse",
              "darker",
              "colder"
            ],
            "answer": 0,
            "explanation_cn": "污染少了，空气变得更「好」，better。"
          },
          {
            "id": "w2-thu-cz4",
            "type": "choice",
            "question": "4___",
            "options": [
              "in",
              "on",
              "at",
              "under"
            ],
            "answer": 0,
            "explanation_cn": "「坐在车里」用 in a car。"
          },
          {
            "id": "w2-thu-cz5",
            "type": "choice",
            "question": "5___",
            "options": [
              "charge",
              "change",
              "choose",
              "catch"
            ],
            "answer": 0,
            "explanation_cn": "在充电站「充电」，charge。"
          },
          {
            "id": "w2-thu-cz6",
            "type": "choice",
            "question": "6___",
            "options": [
              "be",
              "is",
              "are",
              "was"
            ],
            "answer": 0,
            "explanation_cn": "will 后面用动词原形 be。"
          }
        ]
      },
      {
        "id": "w2-thu-tense",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 10,
        "questions": [
          {
            "id": "w2-thu-tn1",
            "type": "fill",
            "question": "High-speed trains ___ (run) at 350 kilometres per hour. [填入正确形式]",
            "answer": "run",
            "explanation_cn": "表示客观事实，主语复数，用一般现在时 run。"
          },
          {
            "id": "w2-thu-tn2",
            "type": "fill",
            "question": "I ___ (take) the high-speed train to Shanghai last week. [填入正确形式]",
            "answer": "took",
            "explanation_cn": "last week 过去时间，take 的过去式是 took。"
          },
          {
            "id": "w2-thu-tn3",
            "type": "fill",
            "question": "Look! The robot ___ (clean) the street now. [填入正确形式]",
            "answer": "is cleaning",
            "explanation_cn": "Look! 提示正在进行，用 is cleaning。"
          },
          {
            "id": "w2-thu-tn4",
            "type": "fill",
            "question": "Mobile payment ___ (change) our life a lot in the last ten years. [填入正确形式]",
            "answer": "has changed",
            "explanation_cn": "in the last ten years 与现在完成时连用：has changed。"
          },
          {
            "id": "w2-thu-tn5",
            "type": "fill",
            "question": "People ___ (carry) cash everywhere ten years ago. [填入正确形式]",
            "answer": "carried",
            "explanation_cn": "ten years ago 过去时间，carry 的过去式是 carried。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周五",
    "day_en": "Friday",
    "is_speaking_day": false,
    "total_duration": 40,
    "theme_cn": "模板写作 + KET/PET题型 + 语法复习",
    "modules": [
      {
        "id": "w2-fri-writing",
        "name_cn": "写作练习",
        "type": "writing_template",
        "duration": 15,
        "title": "My Favorite Invention",
        "requirement_cn": "请根据关键词提示完成作文，完成后请背诵全文。明天将进行挖空默写测试！",
        "keywords": [
          "high-speed train",
          "fast and safe",
          "travel to Beijing",
          "watch the scenery",
          "wonderful"
        ],
        "keywords_cn": [
          "高铁",
          "又快又安全",
          "去北京旅行",
          "看沿途风景",
          "太棒了"
        ],
        "template": "My favorite invention is the {{1}}. It is {{2}}. Last summer, I took it to {{3}} with my parents. On the way, we could {{4}} outside the window. What a {{5}} trip it was!",
        "blanks": [
          {
            "id": 1,
            "hint_cn": "高铁",
            "hint_en": "high-speed train",
            "answer": "high-speed train"
          },
          {
            "id": 2,
            "hint_cn": "又快又安全",
            "hint_en": "fast and safe",
            "answer": "fast and safe"
          },
          {
            "id": 3,
            "hint_cn": "去北京旅行",
            "hint_en": "travel to Beijing",
            "answer": "travel to Beijing"
          },
          {
            "id": 4,
            "hint_cn": "看沿途风景",
            "hint_en": "watch the scenery",
            "answer": "watch the scenery"
          },
          {
            "id": 5,
            "hint_cn": "太棒了",
            "hint_en": "wonderful",
            "answer": "wonderful"
          }
        ],
        "full_text": "My favorite invention is the high-speed train. It is fast and safe. Last summer, I took it to travel to Beijing with my parents. On the way, we could watch the scenery outside the window. What a wonderful trip it was!",
        "full_text_cn": "我最喜欢的发明是高铁。它又快又安全。去年夏天，我和父母坐高铁去北京旅行。一路上，我们可以看窗外的风景。多么棒的一次旅行啊！",
        "explanation_cn": "这篇作文介绍自己最喜欢的发明。注意：1) high-speed train 高铁；2) fast and safe 又快又安全；3) travel to Beijing 去北京旅行；4) watch the scenery 看风景；5) What a + 名词短语 感叹句。全文用一般过去时讲一次旅行。",
        "explanation_en": "This essay is about a favorite animal, using 5 keywords. Notes: 1) 'favorite animal'; 2) 'black and white' joins two colors with 'and'; 3) 'bamboo' is uncountable; 4) after 'can', use the base verb 'climb trees'; 5) 'lovely' means cute. The whole essay uses the simple present tense."
      },
      {
        "id": "w2-fri-ket",
        "name_cn": "KET/PET题型",
        "type": "ket_pet",
        "duration": 12,
        "questions": [
          {
            "id": "w2-fri-kp1",
            "type": "choice",
            "question": "KET: — How did you go to Beijing? — I ___ the high-speed train.",
            "options": [
              "took",
              "take",
              "takes",
              "taking"
            ],
            "answer": 0,
            "explanation_cn": "问句是过去时 did，回答用过去式 took。"
          },
          {
            "id": "w2-fri-kp2",
            "type": "choice",
            "question": "KET: The train is ___ than the bus, so let's take it.",
            "options": [
              "faster",
              "fast",
              "fastest",
              "more fast"
            ],
            "answer": 0,
            "explanation_cn": "than 比较级用 faster。"
          },
          {
            "id": "w2-fri-kp3",
            "type": "choice",
            "question": "KET: — ___ will the trip take? — About four hours.",
            "options": [
              "How long",
              "How often",
              "How much",
              "How many"
            ],
            "answer": 0,
            "explanation_cn": "问时间长度用 How long。"
          },
          {
            "id": "w2-fri-kp4",
            "type": "choice",
            "question": "KET: You ___ use paper tickets any more.",
            "options": [
              "don't need to",
              "needn't to",
              "not need",
              "don't need"
            ],
            "answer": 0,
            "explanation_cn": "don't need to do sth：不再需要做某事。"
          },
          {
            "id": "w2-fri-kp5",
            "type": "choice",
            "question": "KET: Remember ___ your ID card for the trip.",
            "options": [
              "to bring",
              "bringing",
              "bring",
              "brings"
            ],
            "answer": 0,
            "explanation_cn": "remember to do sth：记得带上身份证。"
          },
          {
            "id": "w2-fri-kp6",
            "type": "choice",
            "question": "KET: — Whose phone is this? — It's ___.",
            "options": [
              "mine",
              "my",
              "me",
              "I"
            ],
            "answer": 0,
            "explanation_cn": "名词性物主代词 mine = my phone。"
          },
          {
            "id": "w2-fri-kp7",
            "type": "choice",
            "question": "KET: There is ___ interesting AI show at the museum.",
            "options": [
              "an",
              "a",
              "the",
              "/（不填）"
            ],
            "answer": 0,
            "explanation_cn": "interesting 元音开头，用 an。"
          },
          {
            "id": "w2-fri-kp8",
            "type": "choice",
            "question": "KET: The robots can work ___ people can rest.",
            "options": [
              "so that",
              "so as",
              "because of",
              "instead"
            ],
            "answer": 0,
            "explanation_cn": "so that 引导目的：机器人工作，以便人可以休息。"
          },
          {
            "id": "w2-fri-kp9",
            "type": "choice",
            "question": "KET: — Do I have to pay now? — No, you ___.",
            "options": [
              "don't have to",
              "mustn't",
              "can't",
              "shouldn't have"
            ],
            "answer": 0,
            "explanation_cn": "have to 的否定回答：don't have to（不必）。"
          },
          {
            "id": "w2-fri-kp10",
            "type": "choice",
            "question": "KET: This is ___ useful app for learning English.",
            "options": [
              "a",
              "an",
              "the",
              "/（不填）"
            ],
            "answer": 0,
            "explanation_cn": "useful 是辅音音素开头 /j/，用 a。"
          },
          {
            "id": "w2-fri-kp11",
            "type": "choice",
            "question": "KET: The new train station ___ in 2023.",
            "options": [
              "opened",
              "opens",
              "is opening",
              "open"
            ],
            "answer": 0,
            "explanation_cn": "in 2023 过去时间，用过去式 opened。"
          },
          {
            "id": "w2-fri-kp12",
            "type": "choice",
            "question": "KET: My brother is interested ___ robots.",
            "options": [
              "in",
              "at",
              "on",
              "for"
            ],
            "answer": 0,
            "explanation_cn": "be interested in…：对…感兴趣。"
          }
        ]
      },
      {
        "id": "w2-fri-grammar",
        "name_cn": "语法复习",
        "type": "grammar",
        "duration": 13,
        "questions": [
          {
            "id": "w2-fri-gr1",
            "type": "choice",
            "question": "China has built many ___ railways since 2008.",
            "options": [
              "high-speed",
              "high speed",
              "highly-speed",
              "highest-speed"
            ],
            "answer": 0,
            "explanation_cn": "high-speed train/railway 是固定说法，作定语。"
          },
          {
            "id": "w2-fri-gr2",
            "type": "choice",
            "question": "The train ___ at six every morning.",
            "options": [
              "leaves",
              "left",
              "leave",
              "is leaving"
            ],
            "answer": 0,
            "explanation_cn": "时刻表用一般现在时，主语三单 leaves。"
          },
          {
            "id": "w2-fri-gr3",
            "type": "choice",
            "question": "It used to ___ ten hours to get there.",
            "options": [
              "take",
              "took",
              "takes",
              "taking"
            ],
            "answer": 0,
            "explanation_cn": "used to do sth：过去常常，后面用原形 take。"
          },
          {
            "id": "w2-fri-gr4",
            "type": "choice",
            "question": "The faster the train is, the ___ time we save.",
            "options": [
              "more",
              "much",
              "most",
              "many"
            ],
            "answer": 0,
            "explanation_cn": "the + 比较级…，the + 比较级…：越快省的时间越多，more time。"
          },
          {
            "id": "w2-fri-gr5",
            "type": "choice",
            "question": "Neither the bus nor the train ___ fast enough.",
            "options": [
              "is",
              "are",
              "were",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "neither…nor… 就近原则，the train 单数用 is。"
          },
          {
            "id": "w2-fri-gr6",
            "type": "choice",
            "question": "The station is ___ from my home, so we take a taxi.",
            "options": [
              "far",
              "far away than",
              "farther most",
              "farest"
            ],
            "answer": 0,
            "explanation_cn": "far from…：离家远。"
          },
          {
            "id": "w2-fri-gr7",
            "type": "choice",
            "question": "Astronauts must learn ___ with each other in space.",
            "options": [
              "to work",
              "working",
              "work",
              "worked"
            ],
            "answer": 0,
            "explanation_cn": "learn to do sth：学会在太空共事。"
          },
          {
            "id": "w2-fri-gr8",
            "type": "choice",
            "question": "The space lesson was ___ interesting that we watched it twice.",
            "options": [
              "so",
              "such",
              "too",
              "very"
            ],
            "answer": 0,
            "explanation_cn": "so + 形容词 + that：如此…以至于。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周六",
    "day_en": "Saturday",
    "is_speaking_day": true,
    "total_duration": 50,
    "theme_cn": "AI口语 + 高频词汇 + 阅读理解",
    "modules": [
      {
        "id": "w2-sat-speaking",
        "name_cn": "AI口语练习",
        "type": "speaking",
        "duration": 30,
        "questions": [
          {
            "id": "w2-sat-sp1",
            "sentence": "What do you do in your free time?",
            "sentence_cn": "你空闲时间做什么？",
            "options": [
              "I read storybooks in my free time.",
              "I did my homework yesterday.",
              "I am free this Sunday.",
              "My free time is very short."
            ],
            "answer": 0,
            "pronunciation_tips": "free time 注意 free /friː/ 长元音，storybooks 是复合词重音在 story",
            "explanation_cn": "问空闲做什么，用一般现在时回答习惯。A 正确；B 是过去；C、D 答非所问。",
            "explanation_en": "The question asks about a habit, so use the simple present. A is correct; B is past; C and D do not answer the question.",
            "answer_cn_hint": "它在问「空闲时间做什么」（习惯），答句要用一般现在时。",
            "options_cn": [
              "我空闲时间读故事书。",
              "我昨天做了作业。",
              "这个星期天我有空。",
              "我的空闲时间很少。"
            ]
          },
          {
            "id": "w2-sat-sp2",
            "sentence": "Can you play any musical instruments?",
            "sentence_cn": "你会演奏乐器吗？",
            "options": [
              "Yes, I can play the piano.",
              "Yes, I like music very much.",
              "I am listening to music now.",
              "The piano is expensive."
            ],
            "answer": 0,
            "pronunciation_tips": "instruments /ˈɪnstrəmənts/ 词尾 -nts 要读清楚，piano /piˈænəʊ/ 重音在第二音节",
            "explanation_cn": "Can 开头的疑问句用 Yes, I can 回答。乐器前面要加 the：play the piano。B 喜欢音乐不等于会乐器。",
            "explanation_en": "A 'Can...?' question is answered with 'Yes, I can'. Note: 'the' goes before instruments: play the piano. Liking music (B) is not the same as playing an instrument.",
            "answer_cn_hint": "这是 Can you… 问句，答句要先说 Yes, I can. 或 No, I can't.，再补一句。",
            "options_cn": [
              "是的，我会弹钢琴。",
              "是的，我很喜欢音乐。",
              "我现在在听音乐。",
              "钢琴很贵。"
            ]
          },
          {
            "id": "w2-sat-sp3",
            "sentence": "Who is your best friend?",
            "sentence_cn": "谁是你最好的朋友？",
            "options": [
              "My best friend is Emma. We are in the same class.",
              "My best friend likes ice cream.",
              "I go to school by bike.",
              "Emma is ten years old."
            ],
            "answer": 0,
            "pronunciation_tips": "best friend 注意 best /best/ 的短元音 e，friend /frend/ 的 ie 读 /e/",
            "explanation_cn": "Who 问人，回答要说出是谁。A 正确并说明了关系；B 只说了喜好；C、D 答非所问。",
            "explanation_en": "'Who' asks about a person, so name the person. A is correct and adds the relationship; B only gives a fact; C and D do not answer the question.",
            "answer_cn_hint": "它在问「谁」，答句要说出一个人的名字，不是说他喜欢什么、几岁。",
            "options_cn": [
              "我最好的朋友是艾玛，我们在同一个班。",
              "我最好的朋友喜欢冰淇淋。",
              "我骑自行车上学。",
              "艾玛十岁。"
            ]
          },
          {
            "id": "w2-sat-sp4",
            "sentence": "What did you have for dinner yesterday?",
            "sentence_cn": "昨天晚饭你吃了什么？",
            "options": [
              "I had rice and fish.",
              "I have rice and fish every day.",
              "I will have rice and fish.",
              "I like fish very much."
            ],
            "answer": 0,
            "pronunciation_tips": "had 是 have 的过去式 /hæd/，注意和 hard /hɑːd/ 区分",
            "explanation_cn": "yesterday 是过去时间，用过去式 had。B 是现在时的习惯，C 是将来，D 没回答吃了什么。",
            "explanation_en": "'Yesterday' requires the past form 'had'. B is a present habit; C is future; D does not say what was eaten.",
            "answer_cn_hint": "它在问「昨天吃了什么」（过去），答句要用过去式 had。",
            "options_cn": [
              "我吃了米饭和鱼。",
              "我每天吃米饭和鱼。",
              "我将要吃米饭和鱼。",
              "我很喜欢鱼。"
            ]
          },
          {
            "id": "w2-sat-sp5",
            "sentence": "Do you like going shopping?",
            "sentence_cn": "你喜欢购物吗？",
            "options": [
              "Not really. I think it is tiring.",
              "Yes, I went shopping yesterday.",
              "The shop opens at nine.",
              "My mother likes shopping."
            ],
            "answer": 0,
            "pronunciation_tips": "shopping 双写 p 加 -ing，tiring /ˈtaɪərɪŋ/ 意为让人累的，注意和 tired（感到累的）区分",
            "explanation_cn": "Do 开头的疑问句要回答 yes/no 的态度。A Not really 意为不算喜欢，是自然回答；B 说的是过去的事；C、D 答非所问。注意 tiring 修饰事物，tired 修饰人。",
            "explanation_en": "The question asks about your attitude, so answer with yes/no plus a reason. 'Not really' is a natural soft no. Note: 'tiring' describes the activity; 'tired' describes how a person feels.",
            "answer_cn_hint": "这是 Do you… 问句，答句要先说 Yes, I do. 或 No, I don't.，再补一句理由。",
            "options_cn": [
              "不太喜欢，我觉得很累人。",
              "是的，我昨天去购物了。",
              "商店九点开门。",
              "我妈妈喜欢购物。"
            ]
          }
        ]
      },
      {
        "id": "w2-sat-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "guitar",
            "phonetic": "/ɡɪˈtɑː/",
            "meaning": "吉他",
            "emoji": "🎸",
            "example_en": "He plays the guitar very well.",
            "example_cn": "他吉他弹得很好。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🎸",
                  "⭐",
                  "🚗",
                  "⚽"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "⚽",
                  "⭐",
                  "🎸",
                  "🚗"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "guitar 是什么意思？（1/2）",
                "options": [
                  "绘画",
                  "国际象棋",
                  "吉他",
                  "相机"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "guitar 是什么意思？（2/2）",
                "options": [
                  "吉他",
                  "相机",
                  "绘画",
                  "国际象棋"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: g__tar",
                "answer": "ui"
              }
            ],
            "letters": [
              "g",
              "u",
              "i",
              "t",
              "a",
              "r"
            ],
            "syllables": [
              "gui",
              "tar"
            ],
            "hint_cn": "有六根弦，抱着弹会叮咚响"
          },
          {
            "word": "painting",
            "phonetic": "/ˈpeɪntɪŋ/",
            "meaning": "绘画；画作",
            "emoji": "🎨",
            "example_en": "Her painting won a prize.",
            "example_cn": "她的画得奖了。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🎨",
                  "⭐",
                  "🌧️",
                  "🎲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎲",
                  "⭐",
                  "🎨",
                  "🌧️"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "painting 是什么意思？（1/2）",
                "options": [
                  "吉他",
                  "奖品",
                  "绘画；画作",
                  "国际象棋"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "painting 是什么意思？（2/2）",
                "options": [
                  "绘画；画作",
                  "国际象棋",
                  "吉他",
                  "奖品"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: pa__ting",
                "answer": "in"
              }
            ],
            "letters": [
              "p",
              "a",
              "i",
              "n",
              "t",
              "i",
              "n",
              "g"
            ],
            "syllables": [
              "pain",
              "ting"
            ],
            "hint_cn": "用画笔和颜料做出来的作品"
          },
          {
            "word": "chess",
            "phonetic": "/tʃes/",
            "meaning": "国际象棋",
            "emoji": "♟️",
            "example_en": "My grandpa teaches me chess.",
            "example_cn": "爷爷教我下国际象棋。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "♟️",
                  "⚽",
                  "🎵",
                  "🚲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🚲",
                  "⚽",
                  "♟️",
                  "🎵"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "chess 是什么意思？（1/2）",
                "options": [
                  "绘画",
                  "吉他",
                  "国际象棋",
                  "相机"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "chess 是什么意思？（2/2）",
                "options": [
                  "国际象棋",
                  "相机",
                  "绘画",
                  "吉他"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: ch__ss",
                "answer": "e"
              }
            ],
            "letters": [
              "c",
              "h",
              "e",
              "s",
              "s"
            ],
            "syllables": [
              "chess"
            ],
            "hint_cn": "黑白格子的棋盘，两个人你一步我一步"
          },
          {
            "word": "camera",
            "phonetic": "/ˈkæmrə/",
            "meaning": "相机",
            "emoji": "📷",
            "example_en": "Don't forget your camera.",
            "example_cn": "别忘了带相机。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "📷",
                  "⭐",
                  "🎸",
                  "🌧️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🌧️",
                  "⭐",
                  "📷",
                  "🎸"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "camera 是什么意思？（1/2）",
                "options": [
                  "国际象棋",
                  "绘画",
                  "相机",
                  "奖品"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "camera 是什么意思？（2/2）",
                "options": [
                  "相机",
                  "奖品",
                  "国际象棋",
                  "绘画"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: ca__ra",
                "answer": "me"
              }
            ],
            "letters": [
              "c",
              "a",
              "m",
              "e",
              "r",
              "a"
            ],
            "syllables": [
              "ca",
              "me",
              "ra"
            ],
            "hint_cn": "咔嚓一下，把风景留下来"
          },
          {
            "word": "prize",
            "phonetic": "/praɪz/",
            "meaning": "奖品",
            "emoji": "🏆",
            "example_en": "He got a prize for his painting.",
            "example_cn": "他的画得了奖。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🏆",
                  "⭐",
                  "🎲",
                  "🚲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🚲",
                  "⭐",
                  "🏆",
                  "🎲"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "prize 是什么意思？（1/2）",
                "options": [
                  "相机",
                  "国际象棋",
                  "奖品",
                  "绘画"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "prize 是什么意思？（2/2）",
                "options": [
                  "奖品",
                  "绘画",
                  "相机",
                  "国际象棋"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: pr__e",
                "answer": "iz"
              }
            ],
            "letters": [
              "p",
              "r",
              "i",
              "z",
              "e"
            ],
            "syllables": [
              "prize"
            ],
            "hint_cn": "比赛赢了以后，发给你的那样东西"
          }
        ]
      },
      {
        "id": "w2-sat-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "Artificial intelligence, or AI, is becoming a big part of our life. AI can recognize faces, translate languages and answer questions. Some students use AI tools to practise English — the AI listens and helps them correct their mistakes. But AI is not perfect. It sometimes makes mistakes, so people must check its answers. Scientists say AI is a good helper, but the most important thinking is still done by people.",
        "passage_cn": "人工智能（AI）正在成为我们生活中重要的一部分。AI能识别人脸、翻译语言、回答问题。一些学生用AI工具练习英语——AI会听他们朗读，帮他们纠正错误。但AI并不完美。它有时会出错，所以人们必须检查它的答案。科学家说AI是好帮手，但最重要的思考仍然由人来做。",
        "questions": [
          {
            "id": "w2-sat-rd1",
            "type": "choice",
            "question": "What can AI do?",
            "options": [
              "Recognize faces, translate and answer questions",
              "Cook all the meals",
              "Go to school for kids",
              "Sleep all day"
            ],
            "answer": 0,
            "explanation_cn": "AI 能识别人脸、翻译语言、回答问题。"
          },
          {
            "id": "w2-sat-rd2",
            "type": "choice",
            "question": "What do some students use AI for?",
            "options": [
              "Practising English",
              "Playing games all day",
              "Watching TV",
              "Doing nothing"
            ],
            "answer": 0,
            "explanation_cn": "学生用 AI 工具练英语，AI 帮他们纠错。"
          },
          {
            "id": "w2-sat-rd5",
            "type": "choice",
            "question": "Is AI perfect?",
            "options": [
              "No, it sometimes makes mistakes.",
              "Yes, it is always right.",
              "Yes, but it is slow.",
              "No, it never works."
            ],
            "answer": 0,
            "explanation_cn": "AI 不完美，有时会出错，要人工检查。"
          },
          {
            "id": "w2-sat-rd10",
            "type": "choice",
            "question": "The best title for the passage about AI is ___.",
            "options": [
              "AI in Our Life",
              "Robots Are Bad",
              "How to Play Games",
              "Doctors and Nurses"
            ],
            "answer": 0,
            "explanation_cn": "全文介绍 AI 在生活各方面的应用与不足。"
          }
        ]
      },
      {
        "id": "w2-sat-mc",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 5,
        "questions": [
          {
            "id": "w2-sat-mc1",
            "type": "choice",
            "question": "AI ___ recognize faces and translate languages.",
            "options": [
              "can",
              "cans",
              "is",
              "are"
            ],
            "answer": 0,
            "explanation_cn": "情态动词 can 后面用动词原形。"
          },
          {
            "id": "w2-sat-mc2",
            "type": "choice",
            "question": "Some students use AI tools ___ English.",
            "options": [
              "to practise",
              "practise",
              "practising",
              "practised"
            ],
            "answer": 0,
            "explanation_cn": "use sth to do sth：用 AI 工具来练英语。"
          },
          {
            "id": "w2-sat-mc3",
            "type": "choice",
            "question": "The AI listens and ___ them correct mistakes.",
            "options": [
              "helps",
              "help",
              "helping",
              "helped"
            ],
            "answer": 0,
            "explanation_cn": "主语 the AI 三单，用 helps。"
          },
          {
            "id": "w2-sat-mc4",
            "type": "choice",
            "question": "In hospitals, AI helps doctors ___ X-ray pictures.",
            "options": [
              "read",
              "reads",
              "reading",
              "readed"
            ],
            "answer": 0,
            "explanation_cn": "help sb do sth：help 后面用动词原形 read。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周日",
    "day_en": "Sunday",
    "is_speaking_day": false,
    "total_duration": 20,
    "theme_cn": "阅读理解 + 高频词汇 + 完形填空",
    "modules": [
      {
        "id": "w2-sun-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "spring",
            "phonetic": "/sprɪŋ/",
            "meaning": "春天",
            "emoji": "🌷",
            "example_en": "Flowers come out in spring.",
            "example_cn": "春天花儿开放。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🌷",
                  "⭐",
                  "⛄",
                  "🍂"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🍂",
                  "⭐",
                  "🌷",
                  "⛄"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "spring 是什么意思？（1/2）",
                "options": [
                  "风筝",
                  "雪人",
                  "春天",
                  "野餐"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "spring 是什么意思？（2/2）",
                "options": [
                  "春天",
                  "野餐",
                  "风筝",
                  "雪人"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: s__ing",
                "answer": "pr"
              }
            ],
            "letters": [
              "s",
              "p",
              "r",
              "i",
              "n",
              "g"
            ],
            "syllables": [
              "spring"
            ],
            "hint_cn": "一年开头的那一季，花会开、草会绿"
          },
          {
            "word": "kite",
            "phonetic": "/kaɪt/",
            "meaning": "风筝",
            "emoji": "🪁",
            "example_en": "Let's fly a kite in the park.",
            "example_cn": "我们去公园放风筝吧。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🪁",
                  "⭐",
                  "🎵",
                  "🚗"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🚗",
                  "⭐",
                  "🪁",
                  "🎵"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "kite 是什么意思？（1/2）",
                "options": [
                  "春天",
                  "秋天",
                  "风筝",
                  "野餐"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "kite 是什么意思？（2/2）",
                "options": [
                  "风筝",
                  "野餐",
                  "春天",
                  "秋天"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: k__e",
                "answer": "it"
              }
            ],
            "letters": [
              "k",
              "i",
              "t",
              "e"
            ],
            "syllables": [
              "kite"
            ],
            "hint_cn": "有线牵着，能飞到天上去"
          },
          {
            "word": "autumn",
            "phonetic": "/ˈɔːtəm/",
            "meaning": "秋天",
            "emoji": "🍂",
            "example_en": "Autumn is cool and golden.",
            "example_cn": "秋天凉爽，一片金黄。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🍂",
                  "⭐",
                  "☂️",
                  "⚽"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "⚽",
                  "⭐",
                  "🍂",
                  "☂️"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "autumn 是什么意思？（1/2）",
                "options": [
                  "风筝",
                  "野餐",
                  "秋天",
                  "雪人"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "autumn 是什么意思？（2/2）",
                "options": [
                  "秋天",
                  "雪人",
                  "风筝",
                  "野餐"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: au__mn",
                "answer": "tu"
              }
            ],
            "letters": [
              "a",
              "u",
              "t",
              "u",
              "m",
              "n"
            ],
            "syllables": [
              "au",
              "tumn"
            ],
            "hint_cn": "树叶变黄往下落的那一季"
          },
          {
            "word": "snowman",
            "phonetic": "/ˈsnəʊmæn/",
            "meaning": "雪人",
            "emoji": "⛄",
            "example_en": "We made a snowman yesterday.",
            "example_cn": "我们昨天堆了个雪人。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "⛄",
                  "⭐",
                  "🌷",
                  "🚲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🚲",
                  "⭐",
                  "⛄",
                  "🌷"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "snowman 是什么意思？（1/2）",
                "options": [
                  "秋天",
                  "春天",
                  "雪人",
                  "野餐"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "snowman 是什么意思？（2/2）",
                "options": [
                  "雪人",
                  "野餐",
                  "秋天",
                  "春天"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: snow__an",
                "answer": "m"
              }
            ],
            "letters": [
              "s",
              "n",
              "o",
              "w",
              "m",
              "a",
              "n"
            ],
            "syllables": [
              "snow",
              "man"
            ],
            "hint_cn": "下雪天用雪堆出来的“人”"
          },
          {
            "word": "picnic",
            "phonetic": "/ˈpɪknɪk/",
            "meaning": "野餐",
            "emoji": "🧺",
            "example_en": "We had a picnic by the lake.",
            "example_cn": "我们在湖边野餐了。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🧺",
                  "⭐",
                  "🎸",
                  "🎲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎲",
                  "⭐",
                  "🧺",
                  "🎸"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "picnic 是什么意思？（1/2）",
                "options": [
                  "雪人",
                  "风筝",
                  "野餐",
                  "秋天"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "picnic 是什么意思？（2/2）",
                "options": [
                  "野餐",
                  "秋天",
                  "雪人",
                  "风筝"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: pic__ic",
                "answer": "n"
              }
            ],
            "letters": [
              "p",
              "i",
              "c",
              "n",
              "i",
              "c"
            ],
            "syllables": [
              "pic",
              "nic"
            ],
            "hint_cn": "带着好吃的，去草地上坐着吃"
          }
        ]
      },
      {
        "id": "w2-sun-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "Drones are small flying machines, and they are changing our 1___. A delivery company now sends parcels by drone. The drone 2___ the parcel from the sky and drops it at your door in minutes. Doctors in mountain villages also use drones to get medicine 3___. Before drones, the medicine took two days to arrive; now it 4___ only thirty minutes. Drones are not very 5___, and more and more people can buy one. Maybe one day we will 6___ to school by drone taxi!",
        "questions": [
          {
            "id": "w2-sun-cz1",
            "type": "choice",
            "question": "1___",
            "options": [
              "life",
              "lives",
              "living",
              "lives on"
            ],
            "answer": 0,
            "explanation_cn": "changing our life：改变我们的生活。"
          },
          {
            "id": "w2-sun-cz2",
            "type": "choice",
            "question": "2___",
            "options": [
              "carries",
              "carry",
              "carried",
              "carrying"
            ],
            "answer": 0,
            "explanation_cn": "主语 the drone 三单，一般现在时用 carries。"
          },
          {
            "id": "w2-sun-cz3",
            "type": "choice",
            "question": "3___",
            "options": [
              "quickly",
              "quick",
              "quicker",
              "quickest"
            ],
            "answer": 0,
            "explanation_cn": "修饰动词 get 用副词 quickly（快速地）。"
          },
          {
            "id": "w2-sun-cz4",
            "type": "choice",
            "question": "4___",
            "options": [
              "takes",
              "take",
              "took",
              "taking"
            ],
            "answer": 0,
            "explanation_cn": "it takes + 时间，主语 it 三单用 takes。"
          },
          {
            "id": "w2-sun-cz5",
            "type": "choice",
            "question": "5___",
            "options": [
              "expensive",
              "cheap",
              "free",
              "heavy"
            ],
            "answer": 0,
            "explanation_cn": "后面说更多人买得起，说明不「贵」，expensive。"
          },
          {
            "id": "w2-sun-cz6",
            "type": "choice",
            "question": "6___",
            "options": [
              "fly",
              "flew",
              "flying",
              "flies"
            ],
            "answer": 0,
            "explanation_cn": "will 后面用动词原形 fly。"
          }
        ]
      },
      {
        "id": "w2-sun-listening",
        "name_cn": "听力练习",
        "type": "listening",
        "duration": 5,
        "questions": [
          {
            "id": "w2-sun-ls1",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "The drone carries the parcel from the sky.",
            "options": [
              "The drone carries the parcel from the sky.",
              "The drone carries the parcel from the shop.",
              "The drone carries the basket from the sky.",
              "The pilot carries the parcel from the sky."
            ],
            "answer": 0,
            "explanation_cn": "主语是 drone（无人机），动词 carries（运送）。"
          },
          {
            "id": "w2-sun-ls2",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Doctors in mountain villages use drones to get medicine.",
            "options": [
              "Doctors in mountain villages use drones to get medicine.",
              "Doctors in city hospitals use drones to get medicine.",
              "Doctors in mountain villages use drones to get money.",
              "Teachers in mountain villages use drones to get medicine."
            ],
            "answer": 0,
            "explanation_cn": "地点是 mountain villages（山村），物品是 medicine（药品）。"
          },
          {
            "id": "w2-sun-ls3",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Drones must not fly near airports.",
            "options": [
              "Drones must not fly near airports.",
              "Drones must fly near airports.",
              "Drones must not fly near hospitals.",
              "Birds must not fly near airports."
            ],
            "answer": 0,
            "explanation_cn": "must not fly：禁止飞行；地点是 airports（机场）。"
          },
          {
            "id": "w2-sun-ls4",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Firefighters use drones to see where the fire is.",
            "options": [
              "Firefighters use drones to see where the fire is.",
              "Firemen use drones to see where the water is.",
              "Farmers use drones to see where the fire is.",
              "Firefighters use phones to see where the fire is."
            ],
            "answer": 0,
            "explanation_cn": "使用者是 firefighters（消防员），目的是找火情。"
          },
          {
            "id": "w2-sun-ls5",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Maybe one day we will fly to school by drone taxi.",
            "options": [
              "Maybe one day we will fly to school by drone taxi.",
              "Maybe one day we will walk to school by drone taxi.",
              "Maybe one day we will fly to work by drone taxi.",
              "Maybe today we will fly to school by drone taxi."
            ],
            "answer": 0,
            "explanation_cn": "fly to school（飞去上学），时间是 one day（将来某天）。"
          }
        ]
      }
    ]
  }
];

const WEEK3 = [
  {
    "day_cn": "周一",
    "day_en": "Monday",
    "is_speaking_day": true,
    "total_duration": 50,
    "theme_cn": "AI口语 + 高频词汇 + 阅读理解",
    "modules": [
      {
        "id": "w3-mon-speaking",
        "name_cn": "AI口语练习",
        "type": "speaking",
        "duration": 30,
        "questions": [
          {
            "id": "w3-mon-sp1",
            "sentence": "How long have you lived in your city?",
            "sentence_cn": "你在这个城市住了多久了？",
            "options": [
              "I have lived here for nine years.",
              "I live here with my parents.",
              "I lived here in 2020.",
              "I will live here next year."
            ],
            "answer": 0,
            "pronunciation_tips": "注意 have lived 连读，for 弱读 /fə/，nine years 词尾 s 不要丢",
            "explanation_cn": "How long 问持续多久，用现在完成时 have lived + for + 时间段。B 是一般现在时（住在哪里）；C 是过去时间点；D 是将来。",
            "explanation_en": "'How long' asks about a duration, so the present perfect 'have lived + for + period' is used. B answers a different question; C is a past point; D is future.",
            "answer_cn_hint": "How long 问的是「多长时间」，答句要说 for nine years 这样的时间段。",
            "options_cn": [
              "我在这里住了九年了。",
              "我和父母住在这里。",
              "我 2020 年住在这里。",
              "我明年会住在这里。"
            ]
          },
          {
            "id": "w3-mon-sp2",
            "sentence": "What are you good at?",
            "sentence_cn": "你擅长什么？",
            "options": [
              "I am good at swimming.",
              "I am good to my sister.",
              "I am swimming now.",
              "Swimming is difficult."
            ],
            "answer": 0,
            "pronunciation_tips": "be good at 中 at 弱读，swimming 双写 m 加 -ing",
            "explanation_cn": "be good at + 名词/动名词 意为擅长。A 正确；B be good to 意为对……好，搭配不对；C 是正在游泳；D 没回答。",
            "explanation_en": "'Be good at + noun/verb-ing' means to be skilled at something. A is correct; B uses the wrong pattern ('good to' means kind to); C says what you are doing now; D does not answer.",
            "answer_cn_hint": "它在问「擅长什么」，答句要用 be good at 说出一件具体的事。",
            "options_cn": [
              "我擅长游泳。",
              "我对我妹妹很好。",
              "我现在正在游泳。",
              "游泳很难。"
            ]
          },
          {
            "id": "w3-mon-sp3",
            "sentence": "What do you usually have for breakfast?",
            "sentence_cn": "你早餐通常吃什么？",
            "options": [
              "I usually have eggs and milk.",
              "I usually have lunch at school.",
              "I had eggs yesterday.",
              "I will have bread tomorrow."
            ],
            "answer": 0,
            "pronunciation_tips": "usually /ˈjuːʒuəli/ 注意 ʒ 音；have 意为吃，喝也用 have：have milk",
            "explanation_cn": "usually 表示习惯，用一般现在时。A 正确；B 答的是午饭；C 是过去；D 是将来。",
            "explanation_en": "'Usually' means a habit, so the simple present is used. A is correct; B answers about lunch; C is past; D is future.",
            "answer_cn_hint": "它在问「早餐吃什么」，答句要说早餐的食物，不能答午饭。",
            "options_cn": [
              "我早餐通常吃鸡蛋和牛奶。",
              "我通常在学校吃午饭。",
              "我昨天吃了鸡蛋。",
              "我明天要吃面包。"
            ]
          },
          {
            "id": "w3-mon-sp4",
            "sentence": "What is your neighborhood like?",
            "sentence_cn": "你家附近是什么样的？",
            "options": [
              "It is quiet and there is a big park nearby.",
              "It is my favorite place.",
              "There are four people in my family.",
              "I like my neighbors very much."
            ],
            "answer": 0,
            "pronunciation_tips": "neighborhood /ˈneɪbəhʊd/ 注意重音在第一音节，quiet /ˈkwaɪət/ 两个音节",
            "explanation_cn": "What is...like? 问是什么样的。A 描述了环境，正确；B 答非所问；C 说的是家庭；D 只说了喜欢邻居。",
            "explanation_en": "'What is...like?' asks for a description. A describes the area; B does not answer; C is about family; D only says you like your neighbors.",
            "answer_cn_hint": "What … like 是在问「是什么样的」，答句要描述环境，比如安静、旁边有大公园。",
            "options_cn": [
              "那里很安静，附近有一个大公园。",
              "这是我最喜欢的地方。",
              "我家有四口人。",
              "我很喜欢我的邻居。"
            ]
          },
          {
            "id": "w3-mon-sp5",
            "sentence": "What did you do on your last birthday?",
            "sentence_cn": "你上个生日做了什么？",
            "options": [
              "I had a party with my friends.",
              "I have a party every year.",
              "I will have a party soon.",
              "My birthday is in May."
            ],
            "answer": 0,
            "pronunciation_tips": "last birthday 注意 had /hæd/ 是 have 的过去式，party /ˈpɑːti/",
            "explanation_cn": "last birthday 是过去时间，用过去式 had。B 是现在的习惯；C 是将来；D 没回答做了什么。",
            "explanation_en": "'Last birthday' is past time, so the past form 'had' is used. B is a present habit; C is future; D does not answer what you did.",
            "answer_cn_hint": "它在问「上个生日做了什么」（过去），答句要用过去式。",
            "options_cn": [
              "我和朋友们开了一个聚会。",
              "我每年都开聚会。",
              "我很快就会开聚会。",
              "我的生日在五月。"
            ]
          }
        ]
      },
      {
        "id": "w3-mon-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "journey",
            "phonetic": "/ˈdʒɜːni/",
            "meaning": "旅行；旅程",
            "emoji": "🧳",
            "example_en": "The journey took three hours.",
            "example_cn": "这段旅程花了三个小时。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🧳",
                  "⭐",
                  "🏝️",
                  "💎"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "💎",
                  "⭐",
                  "🧳",
                  "🏝️"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "journey 是什么意思？（1/2）",
                "options": [
                  "岛屿",
                  "宝藏",
                  "旅行；旅程",
                  "勇敢的"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "journey 是什么意思？（2/2）",
                "options": [
                  "旅行；旅程",
                  "勇敢的",
                  "岛屿",
                  "宝藏"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: j__rney",
                "answer": "ou"
              }
            ],
            "letters": [
              "j",
              "o",
              "u",
              "r",
              "n",
              "e",
              "y"
            ],
            "syllables": [
              "jour",
              "ney"
            ],
            "hint_cn": "从这儿到那儿，路上一整段"
          },
          {
            "word": "island",
            "phonetic": "/ˈaɪlənd/",
            "meaning": "岛屿",
            "emoji": "🏝️",
            "example_en": "They sailed to a small island.",
            "example_cn": "他们航行到了一座小岛。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🏝️",
                  "⭐",
                  "🧳",
                  "🛟"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🛟",
                  "⭐",
                  "🏝️",
                  "🧳"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "island 是什么意思？（1/2）",
                "options": [
                  "旅程",
                  "宝藏",
                  "岛屿",
                  "营救"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "island 是什么意思？（2/2）",
                "options": [
                  "岛屿",
                  "营救",
                  "旅程",
                  "宝藏"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: is__nd",
                "answer": "la"
              }
            ],
            "letters": [
              "i",
              "s",
              "l",
              "a",
              "n",
              "d"
            ],
            "syllables": [
              "is",
              "land"
            ],
            "hint_cn": "四面都是水，中间一块陆地"
          },
          {
            "word": "treasure",
            "phonetic": "/ˈtreʒə/",
            "meaning": "宝藏；珍宝",
            "emoji": "💎",
            "example_en": "The pirates looked for treasure.",
            "example_cn": "海盗们寻找宝藏。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "💎",
                  "⭐",
                  "🌧️",
                  "🎲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎲",
                  "⭐",
                  "💎",
                  "🌧️"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "treasure 是什么意思？（1/2）",
                "options": [
                  "岛屿",
                  "旅程",
                  "宝藏；珍宝",
                  "营救"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "treasure 是什么意思？（2/2）",
                "options": [
                  "宝藏；珍宝",
                  "营救",
                  "岛屿",
                  "旅程"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: tr__sure",
                "answer": "ea"
              }
            ],
            "letters": [
              "t",
              "r",
              "e",
              "a",
              "s",
              "u",
              "r",
              "e"
            ],
            "syllables": [
              "trea",
              "sure"
            ],
            "hint_cn": "海盗箱子里那些金银宝贝"
          },
          {
            "word": "brave",
            "phonetic": "/breɪv/",
            "meaning": "勇敢的",
            "emoji": "🦁",
            "example_en": "The brave boy saved the cat.",
            "example_cn": "勇敢的男孩救了猫。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🦁",
                  "⭐",
                  "🚗",
                  "⚽"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "⚽",
                  "⭐",
                  "🦁",
                  "🚗"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "brave 是什么意思？（1/2）",
                "options": [
                  "宝藏",
                  "岛屿",
                  "勇敢的",
                  "旅程"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "brave 是什么意思？（2/2）",
                "options": [
                  "勇敢的",
                  "旅程",
                  "宝藏",
                  "岛屿"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: br__e",
                "answer": "av"
              }
            ],
            "letters": [
              "b",
              "r",
              "a",
              "v",
              "e"
            ],
            "syllables": [
              "brave"
            ],
            "hint_cn": "心里不害怕，敢往前冲"
          },
          {
            "word": "rescue",
            "phonetic": "/ˈreskjuː/",
            "meaning": "营救",
            "emoji": "🛟",
            "example_en": "Firemen rescued the little dog.",
            "example_cn": "消防员救了小狗。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🛟",
                  "⭐",
                  "🎸",
                  "🚲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🚲",
                  "⭐",
                  "🛟",
                  "🎸"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "rescue 是什么意思？（1/2）",
                "options": [
                  "勇敢的",
                  "宝藏",
                  "营救",
                  "岛屿"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "rescue 是什么意思？（2/2）",
                "options": [
                  "营救",
                  "岛屿",
                  "勇敢的",
                  "宝藏"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: res__e",
                "answer": "cu"
              }
            ],
            "letters": [
              "r",
              "e",
              "s",
              "c",
              "u",
              "e"
            ],
            "syllables": [
              "res",
              "cue"
            ],
            "hint_cn": "把遇到危险的人或小动物救出来"
          }
        ]
      },
      {
        "id": "w3-mon-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "Online shopping is now a big part of family life in China. With a few taps on a mobile phone, people can buy clothes, food, books and even fruit from faraway farms. The things they order usually arrive in two or three days. If you don't like the thing you bought, you can send it back easily and get your money back. During big online shopping festivals, the prices are lower and people buy more than usual. Grandma Wang, who is seventy, also learned to shop online — now she buys vegetables for the whole family on her phone.",
        "passage_cn": "网上购物现在是中国家庭生活的重要部分。在手机上点几下，人们就能买到衣服、食品、书籍，甚至远方农场的水果。买的东西通常两三天就送到。如果你不喜欢买到的商品，可以轻松退回并拿回钱。在大型网购节期间，价格更低，人们买得比平时更多。七十岁的王奶奶也学会了网购——现在她用手机给全家买菜。",
        "questions": [
          {
            "id": "w3-mon-rd1",
            "type": "choice",
            "question": "What can people buy online?",
            "options": [
              "Clothes, food, books and fruit",
              "Only books",
              "Only clothes",
              "Nothing fresh"
            ],
            "answer": 0,
            "explanation_cn": "第二句列出了衣服、食品、书和水果。"
          },
          {
            "id": "w3-mon-rd2",
            "type": "choice",
            "question": "How fast does the order usually arrive?",
            "options": [
              "In two or three days",
              "In two or three weeks",
              "In two months",
              "Right now"
            ],
            "answer": 0,
            "explanation_cn": "通常两三天送到。"
          },
          {
            "id": "w3-mon-rd4",
            "type": "choice",
            "question": "What can you do if you don't like your order?",
            "options": [
              "Send it back and get the money back",
              "Throw it away",
              "Give it to the postman",
              "Nothing at all"
            ],
            "answer": 0,
            "explanation_cn": "不喜欢可以轻松退货退款。"
          },
          {
            "id": "w3-mon-rd10",
            "type": "choice",
            "question": "The best title for the passage about buying things online is ___.",
            "options": [
              "Online Shopping in China",
              "How to Cook Vegetables",
              "Grandma's Farm",
              "Shopping Streets"
            ],
            "answer": 0,
            "explanation_cn": "全文介绍中国的网上购物。"
          }
        ]
      },
      {
        "id": "w3-mon-mc",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 5,
        "questions": [
          {
            "id": "w3-mon-mc1",
            "type": "choice",
            "question": "With a few taps on the phone, people ___ buy almost everything.",
            "options": [
              "can",
              "cans",
              "is",
              "are"
            ],
            "answer": 0,
            "explanation_cn": "情态动词 can 后面用动词原形。"
          },
          {
            "id": "w3-mon-mc2",
            "type": "choice",
            "question": "The things you order usually ___ in two or three days.",
            "options": [
              "arrive",
              "arrives",
              "arriving",
              "arrived"
            ],
            "answer": 0,
            "explanation_cn": "主语 the things 复数，一般现在时用 arrive。"
          },
          {
            "id": "w3-mon-mc3",
            "type": "choice",
            "question": "If you don't like it, you can ___ it back easily.",
            "options": [
              "send",
              "sending",
              "sends",
              "sent"
            ],
            "answer": 0,
            "explanation_cn": "can 后面用动词原形 send。"
          },
          {
            "id": "w3-mon-mc4",
            "type": "choice",
            "question": "During shopping festivals, the prices are ___ than usual.",
            "options": [
              "lower",
              "low",
              "lowest",
              "more low"
            ],
            "answer": 0,
            "explanation_cn": "than 比较级用 lower。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周二",
    "day_en": "Tuesday",
    "is_speaking_day": false,
    "total_duration": 30,
    "theme_cn": "阅读理解 + 语法练习 + 单项选择",
    "modules": [
      {
        "id": "w3-tue-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "Shared bikes are everywhere in Chinese cities. To use one, you just open an app on your phone and scan the code on the bike. Shared bikes help people go the last kilometre between the bus stop and their homes. They are also good for the environment because riding a bike makes no pollution. But there is a problem: some people park the bikes in wrong places, and the streets become messy. Now the cities have new rules, and riders must park the bikes in special areas.",
        "passage_cn": "共享单车在中国城市里随处可见。使用时只需打开手机App，扫一下车上的码。共享单车帮助人们解决公交站到家之间「最后一公里」。骑车不产生污染，也很环保。但也有问题：有些人把车停在错误的地方，街道变得乱糟糟。现在城市出台了新规，骑车人必须把车停到专门区域。",
        "questions": [
          {
            "id": "w3-tue-rd2",
            "type": "choice",
            "question": "How do you unlock a shared bike?",
            "options": [
              "Scan the code with an app",
              "Ask a policeman",
              "Use a key",
              "Shout at it"
            ],
            "answer": 0,
            "explanation_cn": "打开手机App扫车上的码即可解锁。"
          },
          {
            "id": "w3-tue-rd4",
            "type": "choice",
            "question": "What problem do shared bikes solve?",
            "options": [
              "The last kilometre between the bus stop and home",
              "Long trips to other cities",
              "Carrying heavy boxes",
              "Crossing big rivers"
            ],
            "answer": 0,
            "explanation_cn": "解决公交站到家的最后一公里。"
          },
          {
            "id": "w3-tue-rd5",
            "type": "choice",
            "question": "Why are shared bikes good for the environment?",
            "options": [
              "Riding makes no pollution.",
              "They are new.",
              "They are expensive.",
              "They are big."
            ],
            "answer": 0,
            "explanation_cn": "骑车不产生污染，所以环保。"
          },
          {
            "id": "w3-tue-rd10",
            "type": "choice",
            "question": "The best title for the passage about shared bikes is ___.",
            "options": [
              "Shared Bikes in Chinese Cities",
              "How to Buy a Bike",
              "Buses and Trains",
              "A Bike Race"
            ],
            "answer": 0,
            "explanation_cn": "全文介绍共享单车的使用、好处和新规。"
          }
        ]
      },
      {
        "id": "w3-tue-grammar",
        "name_cn": "语法练习",
        "type": "grammar",
        "duration": 10,
        "questions": [
          {
            "id": "w3-tue-gr1",
            "type": "choice",
            "question": "There ___ a shared bike station near our school.",
            "options": [
              "is",
              "are",
              "am",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "a station 单数，There be 用 is。"
          },
          {
            "id": "w3-tue-gr2",
            "type": "choice",
            "question": "I ___ a shared bike to the bookstore yesterday.",
            "options": [
              "rode",
              "ride",
              "rides",
              "riding"
            ],
            "answer": 0,
            "explanation_cn": "yesterday 过去时间，ride 的过去式是 rode。"
          },
          {
            "id": "w3-tue-gr3",
            "type": "choice",
            "question": "Bikes are ___ than cars in busy streets.",
            "options": [
              "quicker",
              "quickest",
              "quickly",
              "more quick"
            ],
            "answer": 0,
            "explanation_cn": "than 比较级用 quicker。"
          },
          {
            "id": "w3-tue-gr4",
            "type": "choice",
            "question": "Everyone should ___ the rules when riding.",
            "options": [
              "follow",
              "follows",
              "following",
              "followed"
            ],
            "answer": 0,
            "explanation_cn": "should 后面用动词原形 follow。"
          },
          {
            "id": "w3-tue-gr5",
            "type": "choice",
            "question": "The bike app shows ___ the nearest bike is.",
            "options": [
              "where",
              "what",
              "who",
              "which of"
            ],
            "answer": 0,
            "explanation_cn": "「最近的 bike 在哪」用 where。"
          },
          {
            "id": "w3-tue-gr6",
            "type": "choice",
            "question": "Riding is good exercise ___ it makes no pollution.",
            "options": [
              "and",
              "but",
              "or",
              "so that"
            ],
            "answer": 0,
            "explanation_cn": "两个优点并列用 and。"
          }
        ]
      },
      {
        "id": "w3-tue-choice",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 10,
        "questions": [
          {
            "id": "w3-tue-mc1",
            "type": "choice",
            "question": "Shared bikes ___ everywhere in Chinese cities now.",
            "options": [
              "are",
              "is",
              "was",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "bikes 复数，now 用 are。"
          },
          {
            "id": "w3-tue-mc2",
            "type": "choice",
            "question": "You just open an app and ___ the code.",
            "options": [
              "scan",
              "scans",
              "scanning",
              "scanned"
            ],
            "answer": 0,
            "explanation_cn": "and 并列 open 和 scan，用动词原形。"
          },
          {
            "id": "w3-tue-mc3",
            "type": "choice",
            "question": "It costs one yuan ___ thirty minutes.",
            "options": [
              "for",
              "at",
              "since",
              "from"
            ],
            "answer": 0,
            "explanation_cn": "「三十分钟只要一块钱」用 for thirty minutes。"
          },
          {
            "id": "w3-tue-mc4",
            "type": "choice",
            "question": "Riding makes no pollution, ___ it is good for the environment.",
            "options": [
              "so",
              "but",
              "or",
              "though"
            ],
            "answer": 0,
            "explanation_cn": "「所以」环保，用 so。"
          },
          {
            "id": "w3-tue-mc5",
            "type": "choice",
            "question": "Some people park bikes in wrong places, and the streets become ___.",
            "options": [
              "messy",
              "mess",
              "messily",
              "a mess of"
            ],
            "answer": 0,
            "explanation_cn": "become 后用形容词 messy。"
          },
          {
            "id": "w3-tue-mc6",
            "type": "choice",
            "question": "The cities have new ___ about parking.",
            "options": [
              "rules",
              "rule",
              "ruling",
              "ruled"
            ],
            "answer": 0,
            "explanation_cn": "new rules 新规，rule 用复数。"
          },
          {
            "id": "w3-tue-mc7",
            "type": "choice",
            "question": "We should park the bikes in ___ areas.",
            "options": [
              "special",
              "specially",
              "specials",
              "speciality"
            ],
            "answer": 0,
            "explanation_cn": "areas 名词前用形容词 special。"
          },
          {
            "id": "w3-tue-mc8",
            "type": "choice",
            "question": "It is faster ___ ride a shared bike for short trips.",
            "options": [
              "to",
              "for",
              "of",
              "at"
            ],
            "answer": 0,
            "explanation_cn": "It is faster to do sth：短途骑车更快。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周三",
    "day_en": "Wednesday",
    "is_speaking_day": true,
    "total_duration": 50,
    "theme_cn": "AI口语 + 高频词汇 + 阅读理解",
    "modules": [
      {
        "id": "w3-wed-speaking",
        "name_cn": "AI口语练习",
        "type": "speaking",
        "duration": 30,
        "questions": [
          {
            "id": "w3-wed-sp1",
            "sentence": "What's the best gift you have ever got?",
            "sentence_cn": "你收到过最好的礼物是什么？",
            "options": [
              "The best gift I have got is a bike.",
              "I will get a gift next week.",
              "Gifts are expensive.",
              "I like getting gifts."
            ],
            "answer": 0,
            "pronunciation_tips": "the best gift 注意 have ever got 连读，got /ɡɒt/ 短促有力",
            "explanation_cn": "you have ever got 是现在完成时，回答也用完成时呼应。A 正确；B 是将来；C、D 答非所问。",
            "explanation_en": "'You have ever got' is present perfect, so the answer echoes it. A is correct; B is future; C and D do not answer.",
            "answer_cn_hint": "它在问「收到过的最好的礼物」，答句要说出一样东西。",
            "options_cn": [
              "我收到过最好的礼物是一辆自行车。",
              "我下周会收到一份礼物。",
              "礼物很贵。",
              "我喜欢收礼物。"
            ]
          },
          {
            "id": "w3-wed-sp2",
            "sentence": "How long does it take you to get to school?",
            "sentence_cn": "你到学校要花多长时间？",
            "options": [
              "It takes me about fifteen minutes by bus.",
              "It is fifteen minutes long.",
              "I take the bus to school.",
              "My school is near my home."
            ],
            "answer": 0,
            "pronunciation_tips": "It takes me 注意 takes /teɪks/ 词尾 s，minutes /ˈmɪnɪts/",
            "explanation_cn": "It takes sb + 时间 + to do 是固定句型。A 正确；B 句子结构不对；C 说的是坐公交但没回答时间；D 没回答。",
            "explanation_en": "'It takes somebody + time + to do' is the fixed pattern. A answers with the time; B is not a correct structure; C and D do not answer.",
            "answer_cn_hint": "How long does it take 问的是「花多长时间」，答句要用 It takes me … 加时间段。",
            "options_cn": [
              "我坐公交车大约要十五分钟。",
              "它有十五分钟长。",
              "我坐公交车去上学。",
              "我的学校离家很近。"
            ]
          },
          {
            "id": "w3-wed-sp3",
            "sentence": "What are you going to do this weekend?",
            "sentence_cn": "这周末你打算做什么？",
            "options": [
              "I am going to visit my grandparents.",
              "I visited them last weekend.",
              "I go to school every day.",
              "They live in the countryside."
            ],
            "answer": 0,
            "pronunciation_tips": "going to 口语常读作 gonna /ˈɡənə/，visit /ˈvɪzɪt/ 重音在第一音节",
            "explanation_cn": "be going to 表示计划打算。A 正确；B 是过去；C 与周末无关；D 没回答自己的打算。",
            "explanation_en": "'Be going to' expresses a plan. A is correct; B is past; C is unrelated; D does not answer.",
            "answer_cn_hint": "它在问「打算做什么」（将来），答句要用 be going to 或 will。",
            "options_cn": [
              "我打算去看望爷爷奶奶。",
              "我上周末去看他们了。",
              "我每天去上学。",
              "他们住在乡下。"
            ]
          },
          {
            "id": "w3-wed-sp4",
            "sentence": "What's your favorite book?",
            "sentence_cn": "你最喜欢的书是什么？",
            "options": [
              "My favorite book is Harry Potter.",
              "I read books in the evening.",
              "Books are my friends.",
              "I bought a book yesterday."
            ],
            "answer": 0,
            "pronunciation_tips": "favorite /ˈfeɪvərɪt/ 美音常读三音节，book /bʊk/ 短元音",
            "explanation_cn": "A 直接回答书名，正确。B 是读书时间；C 是比喻；D 只说买了书。",
            "explanation_en": "A names the book directly. B says when you read; C is a metaphor; D only says you bought one.",
            "answer_cn_hint": "它在问「最喜欢的书」，答句要说出书名。",
            "options_cn": [
              "我最喜欢的书是《哈利·波特》。",
              "我在晚上读书。",
              "书是我的朋友。",
              "我昨天买了一本书。"
            ]
          },
          {
            "id": "w3-wed-sp5",
            "sentence": "Do you often help your parents do housework?",
            "sentence_cn": "你经常帮父母做家务吗？",
            "options": [
              "Yes, I clean my room every day.",
              "Yes, my parents clean the house.",
              "The housework is not easy.",
              "I am cleaning the kitchen now."
            ],
            "answer": 0,
            "pronunciation_tips": "housework /ˈhaʊswɜːk/ 复合词重音在前，clean /kliːn/ 长元音",
            "explanation_cn": "often 问频率习惯，A 用 every day 呼应，正确。B 说的是父母做；C 评价家务；D 是现在进行时，不是习惯。",
            "explanation_en": "The question asks about a habit, so A ('every day') fits. B is about the parents; C is an opinion; D is happening now, not a habit.",
            "answer_cn_hint": "这是 Do you… 问句，答句要先说 Yes, I do. 或 No, I don't.，再说你做什么。",
            "options_cn": [
              "是的，我每天打扫我的房间。",
              "是的，我父母打扫房子。",
              "家务不轻松。",
              "我现在在打扫厨房。"
            ]
          }
        ]
      },
      {
        "id": "w3-wed-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "museum",
            "phonetic": "/mjuˈziːəm/",
            "meaning": "博物馆",
            "emoji": "🏛️",
            "example_en": "We visited the science museum.",
            "example_cn": "我们参观了科学博物馆。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🏛️",
                  "⭐",
                  "🦕",
                  "🪐"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🪐",
                  "⭐",
                  "🏛️",
                  "🦕"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "museum 是什么意思？（1/2）",
                "options": [
                  "恐龙",
                  "行星",
                  "博物馆",
                  "望远镜"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "museum 是什么意思？（2/2）",
                "options": [
                  "博物馆",
                  "望远镜",
                  "恐龙",
                  "行星"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: mu__um",
                "answer": "se"
              }
            ],
            "letters": [
              "m",
              "u",
              "s",
              "e",
              "u",
              "m"
            ],
            "syllables": [
              "mu",
              "se",
              "um"
            ],
            "hint_cn": "一个地方，里面摆着很多老东西给人看"
          },
          {
            "word": "dinosaur",
            "phonetic": "/ˈdaɪnəsɔː/",
            "meaning": "恐龙",
            "emoji": "🦕",
            "example_en": "Dinosaurs lived long ago.",
            "example_cn": "恐龙生活在很久以前。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🦕",
                  "⭐",
                  "🏛️",
                  "🚀"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🚀",
                  "⭐",
                  "🦕",
                  "🏛️"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "dinosaur 是什么意思？（1/2）",
                "options": [
                  "博物馆",
                  "火箭",
                  "恐龙",
                  "行星"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "dinosaur 是什么意思？（2/2）",
                "options": [
                  "恐龙",
                  "行星",
                  "博物馆",
                  "火箭"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: di__saur",
                "answer": "no"
              }
            ],
            "letters": [
              "d",
              "i",
              "n",
              "o",
              "s",
              "a",
              "u",
              "r"
            ],
            "syllables": [
              "di",
              "no",
              "saur"
            ],
            "hint_cn": "很久很久以前的大动物，现在早就没有了"
          },
          {
            "word": "planet",
            "phonetic": "/ˈplænɪt/",
            "meaning": "行星",
            "emoji": "🪐",
            "example_en": "The Earth is a planet.",
            "example_cn": "地球是一颗行星。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🪐",
                  "⭐",
                  "🔭",
                  "🎲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎲",
                  "⭐",
                  "🪐",
                  "🔭"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "planet 是什么意思？（1/2）",
                "options": [
                  "恐龙",
                  "望远镜",
                  "行星",
                  "博物馆"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "planet 是什么意思？（2/2）",
                "options": [
                  "行星",
                  "博物馆",
                  "恐龙",
                  "望远镜"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: pl__et",
                "answer": "an"
              }
            ],
            "letters": [
              "p",
              "l",
              "a",
              "n",
              "e",
              "t"
            ],
            "syllables": [
              "plan",
              "et"
            ],
            "hint_cn": "天上绕着太阳转的大球，地球就是其中一个"
          },
          {
            "word": "telescope",
            "phonetic": "/ˈtelɪskəʊp/",
            "meaning": "望远镜",
            "emoji": "🔭",
            "example_en": "Look at the stars through the telescope.",
            "example_cn": "通过望远镜看星星。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🔭",
                  "⭐",
                  "🚀",
                  "🌧️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🌧️",
                  "⭐",
                  "🔭",
                  "🚀"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "telescope 是什么意思？（1/2）",
                "options": [
                  "行星",
                  "火箭",
                  "望远镜",
                  "博物馆"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "telescope 是什么意思？（2/2）",
                "options": [
                  "望远镜",
                  "博物馆",
                  "行星",
                  "火箭"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: te__scope",
                "answer": "le"
              }
            ],
            "letters": [
              "t",
              "e",
              "l",
              "e",
              "s",
              "c",
              "o",
              "p",
              "e"
            ],
            "syllables": [
              "te",
              "le",
              "scope"
            ],
            "hint_cn": "用它看，很远的星星会变得很大"
          },
          {
            "word": "rocket",
            "phonetic": "/ˈrɒkɪt/",
            "meaning": "火箭",
            "emoji": "🚀",
            "example_en": "The rocket flew into space.",
            "example_cn": "火箭飞向了太空。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🚀",
                  "⭐",
                  "🚲",
                  "🦕"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🦕",
                  "⭐",
                  "🚀",
                  "🚲"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "rocket 是什么意思？（1/2）",
                "options": [
                  "望远镜",
                  "行星",
                  "火箭",
                  "博物馆"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "rocket 是什么意思？（2/2）",
                "options": [
                  "火箭",
                  "博物馆",
                  "望远镜",
                  "行星"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: ro__et",
                "answer": "ck"
              }
            ],
            "letters": [
              "r",
              "o",
              "c",
              "k",
              "e",
              "t"
            ],
            "syllables": [
              "rock",
              "et"
            ],
            "hint_cn": "点着火，一下就冲到天上去"
          }
        ]
      },
      {
        "id": "w3-wed-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "Short videos are very popular now, and some teachers use them to help students learn. In one popular kind of video, a teacher explains a maths problem in just one minute. Many museums also make short videos to show their treasures, so children can enjoy them at home. But watching too many short videos is bad for the eyes, and some videos are not useful at all. Doctors say students should watch screens for less than two hours a day. The best way is to pick good videos, watch for a short time, and then go outside to play.",
        "passage_cn": "短视频现在非常流行，一些老师用它们帮助学生学习。在一种热门视频里，老师只用一分钟讲解一道数学题。很多博物馆也拍短视频展示馆藏珍宝，孩子们在家就能欣赏。但看太多短视频伤眼睛，而且有些视频完全没用。医生建议学生每天看屏幕不要超过两小时。最好的办法是：挑好视频、短时间观看，然后出门去玩。",
        "questions": [
          {
            "id": "w3-wed-rd1",
            "type": "choice",
            "question": "What do some teachers use to help students learn?",
            "options": [
              "Short videos",
              "Long films",
              "Radio shows",
              "Paper cards"
            ],
            "answer": 0,
            "explanation_cn": "老师用短视频辅助教学。"
          },
          {
            "id": "w3-wed-rd4",
            "type": "choice",
            "question": "What do museums make short videos for?",
            "options": [
              "Showing their treasures",
              "Selling tickets",
              "Finding workers",
              "Playing games"
            ],
            "answer": 0,
            "explanation_cn": "博物馆用短视频展示馆藏珍宝。"
          },
          {
            "id": "w3-wed-rd6",
            "type": "choice",
            "question": "How long should students watch screens a day?",
            "options": [
              "Less than two hours",
              "More than two hours",
              "All day",
              "Six hours"
            ],
            "answer": 0,
            "explanation_cn": "医生建议每天看屏幕不超过两小时。"
          },
          {
            "id": "w3-wed-rd10",
            "type": "choice",
            "question": "The best title for the passage about short videos is ___.",
            "options": [
              "Short Videos: Good and Bad",
              "How to Be a Star",
              "TV in the Past",
              "Eyes and Glasses"
            ],
            "answer": 0,
            "explanation_cn": "全文讲了短视频的好处和坏处。"
          }
        ]
      },
      {
        "id": "w3-wed-mc",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 5,
        "questions": [
          {
            "id": "w3-wed-mc1",
            "type": "choice",
            "question": "Short videos ___ very popular now.",
            "options": [
              "are",
              "is",
              "am",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "videos 复数，be 动词用 are。"
          },
          {
            "id": "w3-wed-mc2",
            "type": "choice",
            "question": "Some teachers use them ___ students learn.",
            "options": [
              "to help",
              "help",
              "helping",
              "helped"
            ],
            "answer": 0,
            "explanation_cn": "use sth to do sth：用短视频帮学生学习。"
          },
          {
            "id": "w3-wed-mc3",
            "type": "choice",
            "question": "Students can watch it again and again ___ they understand.",
            "options": [
              "until",
              "because",
              "so",
              "but"
            ],
            "answer": 0,
            "explanation_cn": "「直到」看懂为止，用 until。"
          },
          {
            "id": "w3-wed-mc4",
            "type": "choice",
            "question": "Many museums make short videos ___ their treasures.",
            "options": [
              "to show",
              "show",
              "showing",
              "showed"
            ],
            "answer": 0,
            "explanation_cn": "目的用 to show。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周四",
    "day_en": "Thursday",
    "is_speaking_day": false,
    "total_duration": 30,
    "theme_cn": "听力练习 + 完形填空 + 时态练习",
    "modules": [
      {
        "id": "w3-thu-listening",
        "name_cn": "听力练习",
        "type": "listening",
        "duration": 10,
        "questions": [
          {
            "id": "w3-thu-ls1",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "With a few taps on the phone, you can buy almost everything.",
            "options": [
              "With a few taps on the phone, you can buy almost everything.",
              "With a few calls on the phone, you can buy almost everything.",
              "With a few taps on the phone, you can sell almost everything.",
              "With a few taps on the door, you can buy almost everything."
            ],
            "answer": 0,
            "explanation_cn": "taps（点几下）不是 calls（打电话）；buy（买）不是 sell。"
          },
          {
            "id": "w3-thu-ls2",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "The things you order usually arrive in two or three days.",
            "options": [
              "The things you order usually arrive in two or three days.",
              "The things you order usually arrive in two or three weeks.",
              "The things you make usually arrive in two or three days.",
              "The things you order never arrive on time."
            ],
            "answer": 0,
            "explanation_cn": "时间长度是 two or three days（两三天）。"
          },
          {
            "id": "w3-thu-ls3",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Grandma Wang buys vegetables on her phone.",
            "options": [
              "Grandma Wang buys vegetables on her phone.",
              "Grandma Wang sells vegetables on her phone.",
              "Grandma Wang buys flowers on her phone.",
              "Uncle Wang buys vegetables on his phone."
            ],
            "answer": 0,
            "explanation_cn": "buy（买）不是 sell（卖）；人物是 Grandma Wang。"
          },
          {
            "id": "w3-thu-ls4",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "You can find shared bikes near the bus stop.",
            "options": [
              "You can find shared bikes near the bus stop.",
              "You can find shared cars near the bus stop.",
              "You can find shared bikes near the airport.",
              "You can find buses near the shared bike station."
            ],
            "answer": 0,
            "explanation_cn": "shared bikes（共享单车）在公交站附近。"
          },
          {
            "id": "w3-thu-ls5",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "It costs one yuan for thirty minutes.",
            "options": [
              "It costs one yuan for thirty minutes.",
              "It costs ten yuan for thirty minutes.",
              "It costs one yuan for thirteen minutes.",
              "It takes one yuan for thirty minutes."
            ],
            "answer": 0,
            "explanation_cn": "价格是 one yuan（一元），时间 thirty minutes；costs 不是 takes。"
          }
        ]
      },
      {
        "id": "w3-thu-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "Garbage sorting is an important habit in Chinese cities now. In Shanghai and many other cities, people must 1___ their garbage into four kinds: dry, wet, recyclable and harmful. Kitchen waste like banana skins is 2___ garbage. Bottles, paper and old clothes are 3___, because they can be made into new things. Batteries and old medicine are 4___ garbage, so we need 5___ care with them. Sorting garbage takes only one minute every day, but it helps the earth a lot. If everyone takes part, our cities will become 6___ cleaner and more beautiful.",
        "questions": [
          {
            "id": "w3-thu-cz1",
            "type": "choice",
            "question": "1___",
            "options": [
              "divide",
              "divides",
              "dividing",
              "divided"
            ],
            "answer": 0,
            "explanation_cn": "must 后面用动词原形 divide（把垃圾分成四类）。"
          },
          {
            "id": "w3-thu-cz2",
            "type": "choice",
            "question": "2___",
            "options": [
              "wet",
              "dry",
              "harmful",
              "recyclable"
            ],
            "answer": 0,
            "explanation_cn": "香蕉皮等厨余是「湿垃圾」，wet。"
          },
          {
            "id": "w3-thu-cz3",
            "type": "choice",
            "question": "3___",
            "options": [
              "recyclable",
              "wet",
              "harmful",
              "dry"
            ],
            "answer": 0,
            "explanation_cn": "瓶子纸张旧衣服可回收，recyclable。"
          },
          {
            "id": "w3-thu-cz4",
            "type": "choice",
            "question": "4___",
            "options": [
              "harmful",
              "wet",
              "dry",
              "tasty"
            ],
            "answer": 0,
            "explanation_cn": "电池和过期药是「有害垃圾」，harmful。"
          },
          {
            "id": "w3-thu-cz5",
            "type": "choice",
            "question": "5___",
            "options": [
              "special",
              "happily",
              "slowly",
              "loudly"
            ],
            "answer": 0,
            "explanation_cn": "和第 4 空同一句：有害垃圾需要「特别的」处理，special。"
          },
          {
            "id": "w3-thu-cz6",
            "type": "choice",
            "question": "6___",
            "options": [
              "much",
              "many",
              "most",
              "more"
            ],
            "answer": 0,
            "explanation_cn": "much 修饰比较级：much cleaner 干净得多。"
          }
        ]
      },
      {
        "id": "w3-thu-tense",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 10,
        "questions": [
          {
            "id": "w3-thu-tn1",
            "type": "fill",
            "question": "People in Shanghai ___ (start) garbage sorting in 2019. [填入正确形式]",
            "answer": "started",
            "explanation_cn": "in 2019 过去时间，用过去式 started。"
          },
          {
            "id": "w3-thu-tn2",
            "type": "fill",
            "question": "My family ___ (sort) the garbage every evening now. [填入正确形式]",
            "answer": "sorts",
            "explanation_cn": "my family 视为整体，every evening 习惯动作，用 sorts。"
          },
          {
            "id": "w3-thu-tn3",
            "type": "fill",
            "question": "Look! The volunteers ___ (teach) people how to sort. [填入正确形式]",
            "answer": "are teaching",
            "explanation_cn": "Look! 提示正在进行，用 are teaching。"
          },
          {
            "id": "w3-thu-tn4",
            "type": "fill",
            "question": "We ___ (learn) sorting for two years. [填入正确形式]",
            "answer": "have learned",
            "explanation_cn": "for two years 与现在完成时连用。"
          },
          {
            "id": "w3-thu-tn5",
            "type": "fill",
            "question": "The city ___ (give) small gifts to good sorters since 2020. [填入正确形式]",
            "answer": "has given",
            "explanation_cn": "since 2020 与现在完成时连用。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周五",
    "day_en": "Friday",
    "is_speaking_day": false,
    "total_duration": 40,
    "theme_cn": "模板写作 + KET/PET题型 + 语法复习",
    "modules": [
      {
        "id": "w3-fri-writing",
        "name_cn": "写作练习",
        "type": "writing_template",
        "duration": 15,
        "title": "Shopping Online",
        "requirement_cn": "请根据关键词提示完成作文，完成后请背诵全文。明天将进行挖空默写测试！",
        "keywords": [
          "mobile phone",
          "a few taps",
          "two days",
          "cheaper",
          "careful"
        ],
        "keywords_cn": [
          "手机",
          "点几下",
          "两天",
          "更便宜的",
          "细心的"
        ],
        "template": "Now I often shop online with my {{1}}. I just make {{2}} and pay on the screen. The things arrive in about {{3}}. The prices are often {{4}} than in shops. But we must be {{5}} and pick good shops.",
        "blanks": [
          {
            "id": 1,
            "hint_cn": "手机",
            "hint_en": "mobile phone",
            "answer": "mobile phone"
          },
          {
            "id": 2,
            "hint_cn": "点几下",
            "hint_en": "a few taps",
            "answer": "a few taps"
          },
          {
            "id": 3,
            "hint_cn": "两天",
            "hint_en": "two days",
            "answer": "two days"
          },
          {
            "id": 4,
            "hint_cn": "更便宜的",
            "hint_en": "cheaper",
            "answer": "cheaper"
          },
          {
            "id": 5,
            "hint_cn": "细心的",
            "hint_en": "careful",
            "answer": "careful"
          }
        ],
        "full_text": "Now I often shop online with my mobile phone. I just make a few taps and pay on the screen. The things arrive in about two days. The prices are often cheaper than in shops. But we must be careful and pick good shops.",
        "full_text_cn": "现在我常常用手机网购。我只需点几下，在屏幕上付款。东西大约两天送到。价格常常比店里更便宜。但我们必须细心，挑选好店铺。",
        "explanation_cn": "这篇作文介绍网购的步骤和注意点。注意：1) with my mobile phone 用手机；2) a few taps 点几下；3) arrive in two days 两天内到达；4) cheaper than 比较级；5) be careful 细心。全文用一般现在时。",
        "explanation_en": "This essay is about a weekend plan, using 5 keywords. Notes: 1) 'this weekend' at the start as a time adverbial; 2) 'be going to + base verb' for plans; 3) 'will + base verb' for the future; 4) 'fly kites'; 5) 'What an + adjective + noun' is the exclamation pattern; 'exciting' describes things. The essay uses the simple future tense."
      },
      {
        "id": "w3-fri-ket",
        "name_cn": "KET/PET题型",
        "type": "ket_pet",
        "duration": 12,
        "questions": [
          {
            "id": "w3-fri-kp1",
            "type": "choice",
            "question": "KET: — ___ did you pay for the bag? — Fifty yuan.",
            "options": [
              "How much",
              "How many",
              "How long",
              "How often"
            ],
            "answer": 0,
            "explanation_cn": "问价钱用 How much。"
          },
          {
            "id": "w3-fri-kp2",
            "type": "choice",
            "question": "KET: The delivery arrives ___ two days.",
            "options": [
              "in",
              "on",
              "at",
              "for"
            ],
            "answer": 0,
            "explanation_cn": "「两天之内到达」用 in two days。"
          },
          {
            "id": "w3-fri-kp3",
            "type": "choice",
            "question": "KET: There isn't ___ milk at home. Let's buy some online.",
            "options": [
              "any",
              "some",
              "many",
              "a"
            ],
            "answer": 0,
            "explanation_cn": "否定句用 any。"
          },
          {
            "id": "w3-fri-kp4",
            "type": "choice",
            "question": "KET: — ___ bike is that? — It's my shared bike.",
            "options": [
              "Whose",
              "Who",
              "Who's",
              "Which of"
            ],
            "answer": 0,
            "explanation_cn": "问「谁的」用 Whose。"
          },
          {
            "id": "w3-fri-kp5",
            "type": "choice",
            "question": "KET: Online shopping is ___ popular than before.",
            "options": [
              "more",
              "much",
              "most",
              "many"
            ],
            "answer": 0,
            "explanation_cn": "popular 多音节，比较级 more popular。"
          },
          {
            "id": "w3-fri-kp6",
            "type": "choice",
            "question": "KET: You'd better ___ the box with scissors, not teeth.",
            "options": [
              "open",
              "to open",
              "opening",
              "opened"
            ],
            "answer": 0,
            "explanation_cn": "had better do sth：最好用剪刀拆箱。"
          },
          {
            "id": "w3-fri-kp7",
            "type": "choice",
            "question": "KET: The museum is free ___ children under six.",
            "options": [
              "for",
              "at",
              "with",
              "of"
            ],
            "answer": 0,
            "explanation_cn": "「对六岁以下儿童免费」用 for。"
          },
          {
            "id": "w3-fri-kp8",
            "type": "choice",
            "question": "KET: — Must I sort the garbage now? — Yes, you ___.",
            "options": [
              "must",
              "mustn't",
              "needn't",
              "can't"
            ],
            "answer": 0,
            "explanation_cn": "Must 开头的问句肯定回答用 must。"
          },
          {
            "id": "w3-fri-kp9",
            "type": "choice",
            "question": "KET: Riding shared bikes is good ___ our health.",
            "options": [
              "for",
              "at",
              "with",
              "in"
            ],
            "answer": 0,
            "explanation_cn": "be good for…：对健康有好处。"
          },
          {
            "id": "w3-fri-kp10",
            "type": "choice",
            "question": "KET: The robot can answer questions ___ than the old one.",
            "options": [
              "better",
              "good",
              "best",
              "well"
            ],
            "answer": 0,
            "explanation_cn": "than 比较级：better（well 的比较级）。"
          },
          {
            "id": "w3-fri-kp11",
            "type": "choice",
            "question": "KET: My sister enjoys ___ short videos about science.",
            "options": [
              "watching",
              "to watch",
              "watch",
              "watches"
            ],
            "answer": 0,
            "explanation_cn": "enjoy doing sth：喜欢看科普短视频。"
          },
          {
            "id": "w3-fri-kp12",
            "type": "choice",
            "question": "KET: — Where did you buy the model? — I ___ it on the internet.",
            "options": [
              "bought",
              "buy",
              "buys",
              "buying"
            ],
            "answer": 0,
            "explanation_cn": "问句过去时 did，回答用过去式 bought。"
          }
        ]
      },
      {
        "id": "w3-fri-grammar",
        "name_cn": "语法复习",
        "type": "grammar",
        "duration": 13,
        "questions": [
          {
            "id": "w3-fri-gr1",
            "type": "choice",
            "question": "Neither online shopping ___ street markets are going away.",
            "options": [
              "nor",
              "or",
              "either",
              "and"
            ],
            "answer": 0,
            "explanation_cn": "neither…nor…：两者都不会消失。"
          },
          {
            "id": "w3-fri-gr2",
            "type": "choice",
            "question": "The more you sort, the ___ rubbish the earth gets.",
            "options": [
              "less",
              "little",
              "least",
              "fewer than"
            ],
            "answer": 0,
            "explanation_cn": "the + 比较级：分得越多，垃圾越少（rubbish 不可数用 less）。"
          },
          {
            "id": "w3-fri-gr3",
            "type": "choice",
            "question": "It takes the deliveryman half a day ___ in big cities.",
            "options": [
              "to deliver",
              "deliver",
              "delivering",
              "delivered"
            ],
            "answer": 0,
            "explanation_cn": "It takes sb time to do sth：用 to deliver。"
          },
          {
            "id": "w3-fri-gr4",
            "type": "choice",
            "question": "The parcels ___ to our door by drones in some places.",
            "options": [
              "are carried",
              "carried",
              "carry",
              "carries"
            ],
            "answer": 0,
            "explanation_cn": "包裹被运送，一般现在时被动 are carried。"
          },
          {
            "id": "w3-fri-gr5",
            "type": "choice",
            "question": "My grandma is used ___ online now.",
            "options": [
              "to shopping",
              "to shop",
              "shopping",
              "shop"
            ],
            "answer": 0,
            "explanation_cn": "be used to doing sth：习惯于网购。"
          },
          {
            "id": "w3-fri-gr6",
            "type": "choice",
            "question": "The prices during shopping festivals are much ___.",
            "options": [
              "lower",
              "low",
              "lowest",
              "more low"
            ],
            "answer": 0,
            "explanation_cn": "much 修饰比较级 lower。"
          },
          {
            "id": "w3-fri-gr7",
            "type": "choice",
            "question": "Sorting garbage is a habit ___ everyone should have.",
            "options": [
              "that",
              "who",
              "what",
              "whose"
            ],
            "answer": 0,
            "explanation_cn": "先行词是 habit（物），关系词用 that。"
          },
          {
            "id": "w3-fri-gr8",
            "type": "choice",
            "question": "The bikes ___ in special areas from next month.",
            "options": [
              "will park",
              "will be parked",
              "will parked",
              "will parking"
            ],
            "answer": 0,
            "explanation_cn": "车被停放，将来时被动 will be parked。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周六",
    "day_en": "Saturday",
    "is_speaking_day": true,
    "total_duration": 50,
    "theme_cn": "AI口语 + 高频词汇 + 阅读理解",
    "modules": [
      {
        "id": "w3-sat-speaking",
        "name_cn": "AI口语练习",
        "type": "speaking",
        "duration": 30,
        "questions": [
          {
            "id": "w3-sat-sp1",
            "sentence": "What did you do last Sunday?",
            "sentence_cn": "上周日你做了什么？",
            "options": [
              "I helped my mother clean the house.",
              "I help her every Sunday.",
              "I will clean the house tomorrow.",
              "My mother cleans the house."
            ],
            "answer": 0,
            "pronunciation_tips": "helped 词尾 -ed 读 /t/，clean the house 注意 th /ð/ 咬舌",
            "explanation_cn": "last Sunday 是过去时间，用过去式 helped。B 是现在的习惯；C 是将来；D 主语不对。",
            "explanation_en": "'Last Sunday' is past time, so the past form 'helped' is used. B is a present habit; C is future; D changes the subject.",
            "answer_cn_hint": "它在问「上周日做了什么」（过去），答句要用过去式。",
            "options_cn": [
              "我帮妈妈打扫了房子。",
              "我每个星期天都帮她。",
              "我明天要打扫房子。",
              "我妈妈打扫房子。"
            ]
          },
          {
            "id": "w3-sat-sp2",
            "sentence": "What kind of movies do you like?",
            "sentence_cn": "你喜欢哪种电影？",
            "options": [
              "I like cartoons best.",
              "I saw a movie last night.",
              "The movie starts at seven.",
              "I like popcorn very much."
            ],
            "answer": 0,
            "pronunciation_tips": "cartoons /kɑːˈtuːnz/ 重音在第二音节，kind of 连读",
            "explanation_cn": "what kind 问种类，A 回答种类（卡通片），正确。B 说的是看过的电影；C 是放映时间；D 说的是零食。",
            "explanation_en": "'What kind' asks for a type. A answers with a type (cartoons); B talks about one film; C is about the time; D is about popcorn.",
            "answer_cn_hint": "它在问「哪种」，答句要说出电影的类型，比如卡通片、动作片。",
            "options_cn": [
              "我最喜欢卡通片。",
              "我昨晚看了一部电影。",
              "电影七点开始。",
              "我很喜欢爆米花。"
            ]
          },
          {
            "id": "w3-sat-sp3",
            "sentence": "How often do you play sports?",
            "sentence_cn": "你多久运动一次？",
            "options": [
              "I play sports three times a week.",
              "I played basketball yesterday.",
              "I play basketball well.",
              "Sports are good for us."
            ],
            "answer": 0,
            "pronunciation_tips": "How often 注意 often 的 t 可以不发音读 /ˈɒfn/，three times 词尾 s",
            "explanation_cn": "How often 问频率，回答用次数：three times a week。注意 once 一次，twice 两次，三次以上用 times。",
            "explanation_en": "'How often' asks about frequency, so answer with how many times: 'three times a week'. Note: once, twice, then 'times'.",
            "answer_cn_hint": "How often 问的是「多久一次」，答句要用 once a week、three times a week 这类说法。",
            "options_cn": [
              "我一周运动三次。",
              "我昨天打了篮球。",
              "我篮球打得很好。",
              "运动对我们有好处。"
            ]
          },
          {
            "id": "w3-sat-sp4",
            "sentence": "What's your favorite place in your city?",
            "sentence_cn": "你在城里最喜欢的地方是哪里？",
            "options": [
              "My favorite place is the city library.",
              "I live near the library.",
              "The city is very big.",
              "I go there every weekend."
            ],
            "answer": 0,
            "pronunciation_tips": "library /ˈlaɪbrəri/ 注意 br 的连读，city /ˈsɪti/",
            "explanation_cn": "A 直接回答地点，正确。B 说的是住处；C 评价城市；D 没说是哪里。",
            "explanation_en": "A names the place directly. B is about where you live; C describes the city; D does not name a place.",
            "answer_cn_hint": "它在问「哪个地方」，答句要说出一个地点的名字。",
            "options_cn": [
              "我最喜欢的地方是城市图书馆。",
              "我住在图书馆附近。",
              "这个城市很大。",
              "我每个周末都去那里。"
            ]
          },
          {
            "id": "w3-sat-sp5",
            "sentence": "Do you like traveling?",
            "sentence_cn": "你喜欢旅行吗？",
            "options": [
              "Yes, I do. I love visiting new places.",
              "Yes, I traveled to Beijing in 2023.",
              "Traveling costs a lot of money.",
              "My father travels for work."
            ],
            "answer": 0,
            "pronunciation_tips": "traveling 美式只写一个 l，visiting /ˈvɪzɪtɪŋ/ 注意重音",
            "explanation_cn": "Do you like...? 用 Yes, I do 回答并说明原因，A 正确。B 只说了过去的经历；C、D 答非所问。",
            "explanation_en": "Answer 'Do you like...?' with 'Yes, I do' plus a reason. B only gives a past fact; C and D do not answer.",
            "answer_cn_hint": "这是 Do you… 问句，答句要先说 Yes, I do. 或 No, I don't.，再补一句理由。",
            "options_cn": [
              "是的，我喜欢。我很爱去新的地方。",
              "是的，我 2023 年去北京旅行了。",
              "旅行要花很多钱。",
              "我爸爸因为工作经常出差。"
            ]
          }
        ]
      },
      {
        "id": "w3-sat-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "beach",
            "phonetic": "/biːtʃ/",
            "meaning": "沙滩",
            "emoji": "🏖️",
            "example_en": "We played on the beach all day.",
            "example_cn": "我们一整天都在沙滩上玩。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🏖️",
                  "⭐",
                  "🐬",
                  "⛰️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "⛰️",
                  "⭐",
                  "🏖️",
                  "🐬"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "beach 是什么意思？（1/2）",
                "options": [
                  "海浪",
                  "海豚",
                  "沙滩",
                  "阳光"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "beach 是什么意思？（2/2）",
                "options": [
                  "沙滩",
                  "阳光",
                  "海浪",
                  "海豚"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: be__h",
                "answer": "ac"
              }
            ],
            "letters": [
              "b",
              "e",
              "a",
              "c",
              "h"
            ],
            "syllables": [
              "beach"
            ],
            "hint_cn": "海边的沙子地，可以光着脚踩"
          },
          {
            "word": "wave",
            "phonetic": "/weɪv/",
            "meaning": "海浪",
            "emoji": "🌊",
            "example_en": "The waves are big today.",
            "example_cn": "今天海浪很大。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🌊",
                  "⭐",
                  "🚗",
                  "🎲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎲",
                  "⭐",
                  "🌊",
                  "🚗"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "wave 是什么意思？（1/2）",
                "options": [
                  "沙滩",
                  "海豚",
                  "海浪",
                  "沙堡"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "wave 是什么意思？（2/2）",
                "options": [
                  "海浪",
                  "沙堡",
                  "沙滩",
                  "海豚"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: w__e",
                "answer": "av"
              }
            ],
            "letters": [
              "w",
              "a",
              "v",
              "e"
            ],
            "syllables": [
              "wave"
            ],
            "hint_cn": "海里一层一层涌过来的水"
          },
          {
            "word": "sandcastle",
            "phonetic": "/ˈsændkɑːsl/",
            "meaning": "沙堡",
            "emoji": "🏰",
            "example_en": "The children built a sandcastle.",
            "example_cn": "孩子们堆了一座沙堡。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🏰",
                  "⭐",
                  "🌧️",
                  "🏀"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🏀",
                  "⭐",
                  "🏰",
                  "🌧️"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "sandcastle 是什么意思？（1/2）",
                "options": [
                  "沙滩",
                  "阳光",
                  "沙堡",
                  "海浪"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "sandcastle 是什么意思？（2/2）",
                "options": [
                  "沙堡",
                  "海浪",
                  "沙滩",
                  "阳光"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: sandcas__e",
                "answer": "tl"
              }
            ],
            "letters": [
              "s",
              "a",
              "n",
              "d",
              "c",
              "a",
              "s",
              "t",
              "l",
              "e"
            ],
            "syllables": [
              "sand",
              "cas",
              "tle"
            ],
            "hint_cn": "用湿沙子堆出来的小城堡"
          },
          {
            "word": "sunshine",
            "phonetic": "/ˈsʌnʃaɪn/",
            "meaning": "阳光",
            "emoji": "☀️",
            "example_en": "We sat in the warm sunshine.",
            "example_cn": "我们坐在温暖的阳光里。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "☀️",
                  "⭐",
                  "☂️",
                  "🚲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🚲",
                  "⭐",
                  "☀️",
                  "☂️"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "sunshine 是什么意思？（1/2）",
                "options": [
                  "沙堡",
                  "沙滩",
                  "阳光",
                  "海豚"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "sunshine 是什么意思？（2/2）",
                "options": [
                  "阳光",
                  "海豚",
                  "沙堡",
                  "沙滩"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: sun__ine",
                "answer": "sh"
              }
            ],
            "letters": [
              "s",
              "u",
              "n",
              "s",
              "h",
              "i",
              "n",
              "e"
            ],
            "syllables": [
              "sun",
              "shine"
            ],
            "hint_cn": "太阳照下来的、暖暖的光"
          },
          {
            "word": "dolphin",
            "phonetic": "/ˈdɒlfɪn/",
            "meaning": "海豚",
            "emoji": "🐬",
            "example_en": "A dolphin jumped out of the water.",
            "example_cn": "一只海豚跳出了水面。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🐬",
                  "⭐",
                  "🎸",
                  "☂️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "☂️",
                  "⭐",
                  "🐬",
                  "🎸"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "dolphin 是什么意思？（1/2）",
                "options": [
                  "阳光",
                  "海浪",
                  "海豚",
                  "沙堡"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "dolphin 是什么意思？（2/2）",
                "options": [
                  "海豚",
                  "沙堡",
                  "阳光",
                  "海浪"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: do__hin",
                "answer": "lp"
              }
            ],
            "letters": [
              "d",
              "o",
              "l",
              "p",
              "h",
              "i",
              "n"
            ],
            "syllables": [
              "dol",
              "phin"
            ],
            "hint_cn": "海里的动物，会跳出水面，特别聪明"
          }
        ]
      },
      {
        "id": "w3-sat-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "More and more young people love visiting museums in China. Why are museums hot now? First, museums look more beautiful and friendly than before. Many of them use lights, sounds and big screens to show old things in new ways. Second, museums make lovely ice cream, books and toys with pictures of their treasures. Museums are no longer quiet and boring places — they are becoming the most fashionable classrooms in China.",
        "passage_cn": "在中国，越来越多的年轻人喜欢参观博物馆。为什么博物馆现在这么火？第一，博物馆比以前更漂亮、更亲民。很多用灯光、声音和大屏幕，用新方式展示古老文物。第二，博物馆用馆藏形象做出可爱的冰淇淋、书和玩具。博物馆不再是安静无聊的地方——它们正成为中国最时髦的课堂。",
        "questions": [
          {
            "id": "w3-sat-rd1",
            "type": "choice",
            "question": "Who loves visiting museums now?",
            "options": [
              "More and more young people",
              "Only old people",
              "Only tourists from abroad",
              "Nobody"
            ],
            "answer": 0,
            "explanation_cn": "第一句：越来越多的年轻人爱逛博物馆。"
          },
          {
            "id": "w3-sat-rd3",
            "type": "choice",
            "question": "How do museums show old things in new ways?",
            "options": [
              "With lights, sounds and big screens",
              "By hiding them",
              "Only on paper",
              "By selling them"
            ],
            "answer": 0,
            "explanation_cn": "用灯光、声音和大屏幕展示。"
          },
          {
            "id": "w3-sat-rd4",
            "type": "choice",
            "question": "What do museums make with pictures of treasures?",
            "options": [
              "Ice cream, books and toys",
              "Shoes and hats",
              "Phones and computers",
              "Bikes and cars"
            ],
            "answer": 0,
            "explanation_cn": "博物馆文创：冰淇淋、书和玩具。"
          },
          {
            "id": "w3-sat-rd10",
            "type": "choice",
            "question": "The best title for the passage about museums is ___.",
            "options": [
              "Museums Become Hot",
              "Old Things Are Bad",
              "How to Make Ice Cream",
              "Photos Online"
            ],
            "answer": 0,
            "explanation_cn": "全文讲博物馆为什么受欢迎。"
          }
        ]
      },
      {
        "id": "w3-sat-mc",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 5,
        "questions": [
          {
            "id": "w3-sat-mc1",
            "type": "choice",
            "question": "More and more young people love ___ museums.",
            "options": [
              "visiting",
              "visit",
              "visits",
              "visited"
            ],
            "answer": 0,
            "explanation_cn": "love doing sth：喜欢参观博物馆。"
          },
          {
            "id": "w3-sat-mc2",
            "type": "choice",
            "question": "The museums are full ___ students on weekends.",
            "options": [
              "of",
              "in",
              "at",
              "with"
            ],
            "answer": 0,
            "explanation_cn": "be full of…：满是学生。"
          },
          {
            "id": "w3-sat-mc3",
            "type": "choice",
            "question": "People ___ book tickets days before for famous museums.",
            "options": [
              "must",
              "musts",
              "must to",
              "musting"
            ],
            "answer": 0,
            "explanation_cn": "must 后面用动词原形 book。"
          },
          {
            "id": "w3-sat-mc4",
            "type": "choice",
            "question": "Many museums use big screens ___ old things in new ways.",
            "options": [
              "to show",
              "show",
              "showing",
              "showed"
            ],
            "answer": 0,
            "explanation_cn": "目的用不定式 to show。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周日",
    "day_en": "Sunday",
    "is_speaking_day": false,
    "total_duration": 20,
    "theme_cn": "阅读理解 + 高频词汇 + 完形填空",
    "modules": [
      {
        "id": "w3-sun-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "competition",
            "phonetic": "/ˌkɒmpəˈtɪʃn/",
            "meaning": "比赛；竞赛",
            "emoji": "🏅",
            "example_en": "He took part in a chess competition.",
            "example_cn": "他参加了象棋比赛。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🏅",
                  "⭐",
                  "😰",
                  "🥇"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🥇",
                  "⭐",
                  "🏅",
                  "😰"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "competition 是什么意思？（1/2）",
                "options": [
                  "紧张的",
                  "奖牌",
                  "比赛；竞赛",
                  "练习"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "competition 是什么意思？（2/2）",
                "options": [
                  "比赛；竞赛",
                  "练习",
                  "紧张的",
                  "奖牌"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: competi__on",
                "answer": "ti"
              }
            ],
            "letters": [
              "c",
              "o",
              "m",
              "p",
              "e",
              "t",
              "i",
              "t",
              "i",
              "o",
              "n"
            ],
            "syllables": [
              "com",
              "pe",
              "ti",
              "tion"
            ],
            "hint_cn": "大家比一比，看谁做得更好"
          },
          {
            "word": "nervous",
            "phonetic": "/ˈnɜːvəs/",
            "meaning": "紧张的",
            "emoji": "😰",
            "example_en": "I felt nervous before the test.",
            "example_cn": "考试前我很紧张。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "😰",
                  "⭐",
                  "🏅",
                  "🎲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎲",
                  "⭐",
                  "😰",
                  "🏅"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "nervous 是什么意思？（1/2）",
                "options": [
                  "比赛",
                  "奖牌",
                  "紧张的",
                  "青铜的"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "nervous 是什么意思？（2/2）",
                "options": [
                  "紧张的",
                  "青铜的",
                  "比赛",
                  "奖牌"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: ner__ous",
                "answer": "v"
              }
            ],
            "letters": [
              "n",
              "e",
              "r",
              "v",
              "o",
              "u",
              "s"
            ],
            "syllables": [
              "ner",
              "vous"
            ],
            "hint_cn": "心里怦怦跳，手心都出汗了"
          },
          {
            "word": "medal",
            "phonetic": "/ˈmedl/",
            "meaning": "奖牌",
            "emoji": "🥇",
            "example_en": "She won a gold medal.",
            "example_cn": "她赢得了一枚金牌。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🥇",
                  "⭐",
                  "🚗",
                  "🌧️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🌧️",
                  "⭐",
                  "🥇",
                  "🚗"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "medal 是什么意思？（1/2）",
                "options": [
                  "比赛",
                  "紧张的",
                  "奖牌",
                  "练习"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "medal 是什么意思？（2/2）",
                "options": [
                  "奖牌",
                  "练习",
                  "比赛",
                  "紧张的"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: me__l",
                "answer": "da"
              }
            ],
            "letters": [
              "m",
              "e",
              "d",
              "a",
              "l"
            ],
            "syllables": [
              "me",
              "dal"
            ],
            "hint_cn": "挂在脖子上的那块小圆牌"
          },
          {
            "word": "bronze",
            "phonetic": "/brɒnz/",
            "meaning": "青铜；铜牌",
            "emoji": "🥉",
            "example_en": "He got a bronze medal.",
            "example_cn": "他获得了一枚铜牌。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🥉",
                  "⭐",
                  "🥇",
                  "🎸"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎸",
                  "⭐",
                  "🥉",
                  "🥇"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "bronze 是什么意思？（1/2）",
                "options": [
                  "奖牌",
                  "比赛",
                  "青铜；铜牌",
                  "练习"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "bronze 是什么意思？（2/2）",
                "options": [
                  "青铜；铜牌",
                  "练习",
                  "奖牌",
                  "比赛"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: br__ze",
                "answer": "on"
              }
            ],
            "letters": [
              "b",
              "r",
              "o",
              "n",
              "z",
              "e"
            ],
            "syllables": [
              "bronze"
            ],
            "hint_cn": "颜色像旧铜，得第三名拿到的那种牌"
          },
          {
            "word": "practise",
            "phonetic": "/ˈpræktɪs/",
            "meaning": "练习",
            "emoji": "🖊️",
            "example_en": "Practice makes perfect.",
            "example_cn": "熟能生巧。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🖊️",
                  "⭐",
                  "🥉",
                  "☂️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "☂️",
                  "⭐",
                  "🖊️",
                  "🥉"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "practise 是什么意思？（1/2）",
                "options": [
                  "铜牌",
                  "紧张的",
                  "练习",
                  "奖牌"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "practise 是什么意思？（2/2）",
                "options": [
                  "练习",
                  "奖牌",
                  "铜牌",
                  "紧张的"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: pra__ise",
                "answer": "ct"
              }
            ],
            "letters": [
              "p",
              "r",
              "a",
              "c",
              "t",
              "i",
              "s",
              "e"
            ],
            "syllables": [
              "prac",
              "tise"
            ],
            "hint_cn": "一遍一遍地做，做到很熟"
          }
        ]
      },
      {
        "id": "w3-sun-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "More and more people in China love running, and city marathon races are everywhere now. Every year, big cities like Beijing and Shanghai hold marathon 1___. The race 2___ about forty-two kilometres, and it usually starts early in the morning. Many people are not fast, 3___ they keep running to the end. Water and fruit are 4___ at rest points every few kilometres. Children can join the short 5___, maybe three kilometres. Marathon is not just a race — it is a 6___ of never giving up.",
        "questions": [
          {
            "id": "w3-sun-cz1",
            "type": "choice",
            "question": "1___",
            "options": [
              "races",
              "race",
              "racing",
              "raced"
            ],
            "answer": 0,
            "explanation_cn": "hold marathon races：举办马拉松比赛，用复数。"
          },
          {
            "id": "w3-sun-cz2",
            "type": "choice",
            "question": "2___",
            "options": [
              "is",
              "are",
              "am",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "主语 the race 单数，用 is（全长约42公里）。"
          },
          {
            "id": "w3-sun-cz3",
            "type": "choice",
            "question": "3___",
            "options": [
              "but",
              "and",
              "so",
              "or"
            ],
            "answer": 0,
            "explanation_cn": "「虽然」跑得不快「但是」坚持到终点，but。"
          },
          {
            "id": "w3-sun-cz4",
            "type": "choice",
            "question": "4___",
            "options": [
              "free",
              "freely",
              "freer",
              "freedom"
            ],
            "answer": 0,
            "explanation_cn": "水是「免费」提供的，形容词 free。"
          },
          {
            "id": "w3-sun-cz5",
            "type": "choice",
            "question": "5___",
            "options": [
              "race",
              "races",
              "racing",
              "raced"
            ],
            "answer": 0,
            "explanation_cn": "the short race 短程赛，特指用单数。"
          },
          {
            "id": "w3-sun-cz6",
            "type": "choice",
            "question": "6___",
            "options": [
              "lesson",
              "lesson's",
              "lessons of",
              "lessoning"
            ],
            "answer": 0,
            "explanation_cn": "a lesson of never giving up：一堂「永不放弃」的课。"
          }
        ]
      },
      {
        "id": "w3-sun-listening",
        "name_cn": "听力练习",
        "type": "listening",
        "duration": 5,
        "questions": [
          {
            "id": "w3-sun-ls1",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Every year, big cities hold marathon races.",
            "options": [
              "Every year, big cities hold marathon races.",
              "Every year, small villages hold marathon races.",
              "Every year, big cities hold football matches.",
              "Next year, big cities hold marathon races."
            ],
            "answer": 0,
            "explanation_cn": "主语 big cities（大城市），hold（举办）marathon races。"
          },
          {
            "id": "w3-sun-ls2",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "The race is about forty-two kilometres long.",
            "options": [
              "The race is about forty-two kilometres long.",
              "The race is about twenty-four kilometres long.",
              "The race is about forty-two metres long.",
              "The road is about forty-two kilometres long."
            ],
            "answer": 0,
            "explanation_cn": "数字 forty-two（42），单位 kilometres；注意 forty-two 和 twenty-four。"
          },
          {
            "id": "w3-sun-ls3",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Water and fruit are free at rest points.",
            "options": [
              "Water and fruit are free at rest points.",
              "Water and fruit are sold at rest points.",
              "Water and bread are free at rest points.",
              "Water and fruit are free at supermarkets."
            ],
            "answer": 0,
            "explanation_cn": "free（免费）不是 sold（出售）；物品是 water and fruit。"
          },
          {
            "id": "w3-sun-ls4",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Many people keep running to the end.",
            "options": [
              "Many people keep running to the end.",
              "Many people keep walking to the end.",
              "Many people stop running at the end.",
              "Few people keep running to the end."
            ],
            "answer": 0,
            "explanation_cn": "keep running（坚持跑），不是 stop 或 walk。"
          },
          {
            "id": "w3-sun-ls5",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Marathon teaches us never to give up.",
            "options": [
              "Marathon teaches us never to give up.",
              "Marathon tells us never to get up.",
              "Marathon teaches us how to give up.",
              "The teacher teaches us never to give up."
            ],
            "answer": 0,
            "explanation_cn": "give up（放弃）不是 get up（起床）；主语是 Marathon。"
          }
        ]
      }
    ]
  }
];

const WEEK4 = [
  {
    "day_cn": "周一",
    "day_en": "Monday",
    "is_speaking_day": true,
    "total_duration": 50,
    "theme_cn": "AI口语 + 高频词汇 + 阅读理解",
    "modules": [
      {
        "id": "w4-mon-speaking",
        "name_cn": "AI口语练习",
        "type": "speaking",
        "duration": 30,
        "questions": [
          {
            "id": "w4-mon-sp1",
            "sentence": "What would you do if you won a big prize?",
            "sentence_cn": "如果你赢得大奖，你会做什么？",
            "options": [
              "If I won a big prize, I would travel around the world.",
              "If I will win a prize, I am happy.",
              "I won a prize last year.",
              "Prizes are for children."
            ],
            "answer": 0,
            "pronunciation_tips": "虚拟语气 would /wʊd/ 不要读成 will，won /wʌn/ 和 one 同音",
            "explanation_cn": "对将来的假设用虚拟语气：If I won..., I would...。从句用过去式，主句用 would + 动词原形。B 时态搭配错误。",
            "explanation_en": "For an imagined future, use the second conditional: 'If I won..., I would...'. The if-clause uses the past form and the main clause uses 'would + base verb'. B mixes the tenses wrongly.",
            "answer_cn_hint": "这是假设句，答句要用 If … I would … 说出你会做的事。",
            "options_cn": [
              "如果我赢了大奖，我会环游世界。",
              "如果我将会得奖，我很开心。",
              "我去年得过一次奖。",
              "奖品是给小朋友的。"
            ]
          },
          {
            "id": "w4-mon-sp2",
            "sentence": "Do you think students should wear uniforms?",
            "sentence_cn": "你认为学生应该穿校服吗？",
            "options": [
              "Yes, I think uniforms make us look neat.",
              "Yes, I am wearing a uniform now.",
              "Uniforms are made of cotton.",
              "My uniform is too big for me."
            ],
            "answer": 0,
            "pronunciation_tips": "uniform /ˈjuːnɪfɔːm/ 注意 u 读 /juː/，should 词尾 d 不发音",
            "explanation_cn": "问观点，回答要给出看法和理由。A 正确（neat 整洁的）；B 说的是正在穿；C、D 答非所问。",
            "explanation_en": "The question asks for an opinion, so give a view with a reason. A does ('neat' means tidy); B says what you are wearing now; C and D do not answer.",
            "answer_cn_hint": "这是在问你的看法，答句要先说 Yes/No 或者 I think…，再说一句理由。",
            "options_cn": [
              "是的，我认为校服让我们看起来整洁。",
              "是的，我现在穿着校服。",
              "校服是棉花做的。",
              "我的校服对我来说太大了。"
            ]
          },
          {
            "id": "w4-mon-sp3",
            "sentence": "What is the most useful invention in your life?",
            "sentence_cn": "你生活中最有用的发明是什么？",
            "options": [
              "I think the most useful invention is the mobile phone.",
              "I invented a paper plane yesterday.",
              "Inventions are interesting.",
              "My phone is new."
            ],
            "answer": 0,
            "pronunciation_tips": "invention /ɪnˈvenʃn/ 注意重音在第二音节，most useful 连读",
            "explanation_cn": "A 用最高级 the most useful 回答最有用，正确。B 说的是自己发明东西；C、D 答非所问。",
            "explanation_en": "A answers with the superlative 'the most useful'; B talks about making something yourself; C and D do not answer.",
            "answer_cn_hint": "它在问「哪个发明」，答句要说出一样东西，比如手机、电灯。",
            "options_cn": [
              "我认为最有用的发明是手机。",
              "我昨天发明了一架纸飞机。",
              "发明很有趣。",
              "我的手机是新的。"
            ]
          },
          {
            "id": "w4-mon-sp4",
            "sentence": "How do you protect the environment at home?",
            "sentence_cn": "你在家怎么保护环境？",
            "options": [
              "We sort the rubbish and save water at home.",
              "The environment is very important.",
              "My home is near a park.",
              "There is a lot of pollution outside."
            ],
            "answer": 0,
            "pronunciation_tips": "environment /ɪnˈvaɪrənmənt/ 音节多，注意中间 /raɪn/，sort /sɔːt/",
            "explanation_cn": "how 问方法，A 说出具体做法（垃圾分类、节约用水），正确。B 是观点；C、D 答非所问。",
            "explanation_en": "'How' asks for a way or method. A gives concrete actions (sorting rubbish, saving water); B is an opinion; C and D do not answer.",
            "answer_cn_hint": "它在问「怎么保护环境」，答句要说出具体做法，比如垃圾分类、节约用水。",
            "options_cn": [
              "我们在家给垃圾分类，还节约用水。",
              "环境非常重要。",
              "我家在一个公园附近。",
              "外面污染很严重。"
            ]
          },
          {
            "id": "w4-mon-sp5",
            "sentence": "Which subject do you find the most difficult?",
            "sentence_cn": "你觉得哪门科目最难？",
            "options": [
              "Maths. But I am getting better at it.",
              "I find my maths book on the desk.",
              "Maths is my first class today.",
              "I like all the teachers."
            ],
            "answer": 0,
            "pronunciation_tips": "difficult /ˈdɪfɪkəlt/ 注意中间的 k 音，maths 词尾 ths 咬舌",
            "explanation_cn": "A 说出科目并补充自己在进步，正确。B find 在这里是发现的意思被误解为找到；C、D 答非所问。",
            "explanation_en": "A names the subject and adds progress; B misunderstands 'find' (here it means to think something is hard, not to locate); C and D do not answer.",
            "answer_cn_hint": "Which 是在几门科目里选一门，答句要说出科目名，再加上一句感受。",
            "options_cn": [
              "数学。不过我在进步。",
              "我在书桌上找到了我的数学书。",
              "数学是我今天的第一节课。",
              "我喜欢所有的老师。"
            ]
          }
        ]
      },
      {
        "id": "w4-mon-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "invent",
            "phonetic": "/ɪnˈvent/",
            "meaning": "发明",
            "emoji": "💡",
            "example_en": "Who invented the telephone?",
            "example_cn": "谁发明了电话？",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "💡",
                  "⭐",
                  "🔬",
                  "♻️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "♻️",
                  "⭐",
                  "💡",
                  "🔬"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "invent 是什么意思？（1/2）",
                "options": [
                  "实验",
                  "回收利用",
                  "发明",
                  "污染"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "invent 是什么意思？（2/2）",
                "options": [
                  "发明",
                  "污染",
                  "实验",
                  "回收利用"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: in__nt",
                "answer": "ve"
              }
            ],
            "letters": [
              "i",
              "n",
              "v",
              "e",
              "n",
              "t"
            ],
            "syllables": [
              "in",
              "vent"
            ],
            "hint_cn": "想出一个新东西，以前从来没有过"
          },
          {
            "word": "experiment",
            "phonetic": "/ɪkˈsperɪmənt/",
            "meaning": "实验",
            "emoji": "🔬",
            "example_en": "We did an experiment in class.",
            "example_cn": "我们在课堂上做了一个实验。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🔬",
                  "⭐",
                  "💡",
                  "⚡"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "⚡",
                  "⭐",
                  "🔬",
                  "💡"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "experiment 是什么意思？（1/2）",
                "options": [
                  "发明",
                  "能量",
                  "实验",
                  "回收利用"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "experiment 是什么意思？（2/2）",
                "options": [
                  "实验",
                  "回收利用",
                  "发明",
                  "能量"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: expe__ment",
                "answer": "ri"
              }
            ],
            "letters": [
              "e",
              "x",
              "p",
              "e",
              "r",
              "i",
              "m",
              "e",
              "n",
              "t"
            ],
            "syllables": [
              "ex",
              "pe",
              "ri",
              "ment"
            ],
            "hint_cn": "动手试一试，看看会发生什么"
          },
          {
            "word": "recycle",
            "phonetic": "/ˌriːˈsaɪkl/",
            "meaning": "回收利用",
            "emoji": "♻️",
            "example_en": "Please recycle the plastic bottles.",
            "example_cn": "请回收塑料瓶。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "♻️",
                  "⭐",
                  "🏭",
                  "🎲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎲",
                  "⭐",
                  "♻️",
                  "🏭"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "recycle 是什么意思？（1/2）",
                "options": [
                  "污染",
                  "实验",
                  "回收利用",
                  "发明"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "recycle 是什么意思？（2/2）",
                "options": [
                  "回收利用",
                  "发明",
                  "污染",
                  "实验"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: rec__cle",
                "answer": "y"
              }
            ],
            "letters": [
              "r",
              "e",
              "c",
              "y",
              "c",
              "l",
              "e"
            ],
            "syllables": [
              "re",
              "cy",
              "cle"
            ],
            "hint_cn": "用过的瓶子纸箱送回去，重新做成新东西"
          },
          {
            "word": "pollution",
            "phonetic": "/pəˈluːʃn/",
            "meaning": "污染",
            "emoji": "🏭",
            "example_en": "Air pollution is bad for our health.",
            "example_cn": "空气污染有害健康。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🏭",
                  "⭐",
                  "🔬",
                  "☂️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "☂️",
                  "⭐",
                  "🏭",
                  "🔬"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "pollution 是什么意思？（1/2）",
                "options": [
                  "回收利用",
                  "实验",
                  "污染",
                  "能量"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "pollution 是什么意思？（2/2）",
                "options": [
                  "污染",
                  "能量",
                  "回收利用",
                  "实验"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: pol__tion",
                "answer": "lu"
              }
            ],
            "letters": [
              "p",
              "o",
              "l",
              "l",
              "u",
              "t",
              "i",
              "o",
              "n"
            ],
            "syllables": [
              "po",
              "llu",
              "tion"
            ],
            "hint_cn": "水变黑了、天变灰了，就是因为这个"
          },
          {
            "word": "energy",
            "phonetic": "/ˈenədʒi/",
            "meaning": "能量；能源",
            "emoji": "⚡",
            "example_en": "The sun gives us energy.",
            "example_cn": "太阳给我们能量。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "⚡",
                  "⭐",
                  "💡",
                  "🎸"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎸",
                  "⭐",
                  "⚡",
                  "💡"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "energy 是什么意思？（1/2）",
                "options": [
                  "发明",
                  "污染",
                  "能量；能源",
                  "实验"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "energy 是什么意思？（2/2）",
                "options": [
                  "能量；能源",
                  "实验",
                  "发明",
                  "污染"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: en__gy",
                "answer": "er"
              }
            ],
            "letters": [
              "e",
              "n",
              "e",
              "r",
              "g",
              "y"
            ],
            "syllables": [
              "en",
              "er",
              "gy"
            ],
            "hint_cn": "让灯亮起来、让车跑起来的“力气”"
          }
        ]
      },
      {
        "id": "w4-mon-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "The Palace Museum, also known as the Forbidden City, stands in the heart of Beijing. Emperors of the Ming and Qing dynasties lived and worked there for almost 500 years. The palace has about 9000 rooms, and the buildings are made of wood without a single nail. Red walls and golden roofs shine under the blue sky. Today it is one of the most popular museums in the world, and over seventeen million people visit it every year. On snowy days, photos of the red palace in white snow spread quickly on the internet, and people say it becomes the Forbidden City of six hundred years ago again.",
        "passage_cn": "故宫博物院，又叫紫禁城，坐落在北京市中心。明清两代的皇帝在这里生活、理政近五百年。故宫有大约九千间房，建筑全部用木头建成，不用一根钉子。红墙金瓦在蓝天下闪闪发光。今天它是世界上最受欢迎的博物馆之一，每年有一千七百多万人前来参观。下雪天，红墙白雪的照片在网上迅速传播，人们说它又变成了六百年前的紫禁城。",
        "questions": [
          {
            "id": "w4-mon-rd1",
            "type": "choice",
            "question": "What is the Forbidden City also called?",
            "options": [
              "The Palace Museum",
              "The Summer Palace",
              "The Great Wall",
              "Tian'anmen Square"
            ],
            "answer": 0,
            "explanation_cn": "第一句：also known as the Palace Museum（又叫故宫博物院）。"
          },
          {
            "id": "w4-mon-rd3",
            "type": "choice",
            "question": "How long did emperors live and work there?",
            "options": [
              "For almost 500 years",
              "For almost 5000 years",
              "For almost 50 years",
              "For almost 15 years"
            ],
            "answer": 0,
            "explanation_cn": "近五百年（almost 500 years）。"
          },
          {
            "id": "w4-mon-rd5",
            "type": "choice",
            "question": "What are the buildings made of?",
            "options": [
              "Wood without a single nail",
              "Stone and iron",
              "Glass and steel",
              "Paper and bamboo"
            ],
            "answer": 0,
            "explanation_cn": "全木结构，不用一根钉子。"
          },
          {
            "id": "w4-mon-rd10",
            "type": "choice",
            "question": "The best title for the passage about the old palace is ___.",
            "options": [
              "The Palace Museum, Old and New",
              "Snow in Beijing",
              "How to Build a Palace",
              "Emperors' Food"
            ],
            "answer": 0,
            "explanation_cn": "全文介绍故宫的历史与今天的新面貌。"
          }
        ]
      },
      {
        "id": "w4-mon-mc",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 5,
        "questions": [
          {
            "id": "w4-mon-mc1",
            "type": "choice",
            "question": "The Palace Museum ___ in the heart of Beijing.",
            "options": [
              "stands",
              "stand",
              "standing",
              "stood"
            ],
            "answer": 0,
            "explanation_cn": "主语单数，一般现在时用 stands。"
          },
          {
            "id": "w4-mon-mc2",
            "type": "choice",
            "question": "Emperors ___ there for almost 500 years.",
            "options": [
              "lived",
              "live",
              "lives",
              "living"
            ],
            "answer": 0,
            "explanation_cn": "for almost 500 years 过去时间段，用过去式 lived。"
          },
          {
            "id": "w4-mon-mc3",
            "type": "choice",
            "question": "The buildings are made ___ wood without a single nail.",
            "options": [
              "of",
              "from",
              "in",
              "with"
            ],
            "answer": 0,
            "explanation_cn": "be made of 用原材料（看得出原料）用 of。"
          },
          {
            "id": "w4-mon-mc4",
            "type": "choice",
            "question": "___ beautiful the red walls are!",
            "options": [
              "How",
              "What",
              "Where",
              "When"
            ],
            "answer": 0,
            "explanation_cn": "How + 形容词：How beautiful…!"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周二",
    "day_en": "Tuesday",
    "is_speaking_day": false,
    "total_duration": 30,
    "theme_cn": "阅读理解 + 语法练习 + 单项选择",
    "modules": [
      {
        "id": "w4-tue-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "Chang'e is the name of China's moon exploration programme, taken from a goddess in an old Chinese story. In 2020, Chang'e-5 flew to the moon, collected moon soil and brought it back to the earth. It was the first time in over forty years that any country had brought moon rocks home. In 2024, Chang'e-6 did something even more amazing — it brought back soil from the far side of the moon, the side we can never see from the earth. The moon soil helps scientists learn how the moon was born. One day, Chinese astronauts may walk on the moon and build a moon research station, and children watching today may become the builders of tomorrow.",
        "passage_cn": "「嫦娥」是中国探月工程的名字，取自古代神话里的仙女。2020年，嫦娥五号飞向月球，采集月壤并带回地球。这是四十多年来人类首次把月岩带回。2024年，嫦娥六号完成了一项更了不起的任务——带回了月球背面的土壤，那是我们从地球上永远看不到的一面。月壤帮助科学家研究月球是怎样诞生的。将来某一天，中国航天员也许会在月面行走、建立月球科研站，今天观看发射的孩子们，可能就是明天的建设者。",
        "questions": [
          {
            "id": "w4-tue-rd1",
            "type": "choice",
            "question": "Where does the name Chang'e come from?",
            "options": [
              "A goddess in an old Chinese story",
              "A famous scientist",
              "A mountain in China",
              "An old song"
            ],
            "answer": 0,
            "explanation_cn": "名字取自古代神话中的仙女。"
          },
          {
            "id": "w4-tue-rd2",
            "type": "choice",
            "question": "What did Chang'e-5 do in 2020?",
            "options": [
              "It brought moon soil back to the earth.",
              "It planted trees on the moon.",
              "It found water on Mars.",
              "It took tourists to space."
            ],
            "answer": 0,
            "explanation_cn": "嫦娥五号采集月壤并带回地球。"
          },
          {
            "id": "w4-tue-rd4",
            "type": "choice",
            "question": "What was special about Chang'e-6?",
            "options": [
              "It brought back soil from the far side of the moon.",
              "It carried astronauts.",
              "It stayed on the moon for years.",
              "It flew to Mars."
            ],
            "answer": 0,
            "explanation_cn": "嫦娥六号带回了月球背面的土壤。"
          },
          {
            "id": "w4-tue-rd10",
            "type": "choice",
            "question": "The best title for the passage about going to the moon is ___.",
            "options": [
              "Chang'e: China's Moon Journey",
              "Stories of Goddesses",
              "Life on the Moon",
              "Rocks and Stones"
            ],
            "answer": 0,
            "explanation_cn": "全文围绕中国探月工程展开。"
          }
        ]
      },
      {
        "id": "w4-tue-grammar",
        "name_cn": "语法练习",
        "type": "grammar",
        "duration": 10,
        "questions": [
          {
            "id": "w4-tue-gr1",
            "type": "choice",
            "question": "The programme ___ in 2004, and it has grown fast.",
            "options": [
              "started",
              "starts",
              "starting",
              "start"
            ],
            "answer": 0,
            "explanation_cn": "in 2004 过去时间，用过去式 started。"
          },
          {
            "id": "w4-tue-gr2",
            "type": "choice",
            "question": "Moon soil is different ___ the soil on the earth.",
            "options": [
              "from",
              "with",
              "at",
              "of"
            ],
            "answer": 0,
            "explanation_cn": "be different from…：与…不同。"
          },
          {
            "id": "w4-tue-gr3",
            "type": "choice",
            "question": "The robot car can work ___ nobody is there.",
            "options": [
              "when",
              "because",
              "so",
              "but"
            ],
            "answer": 0,
            "explanation_cn": "「在没有人时」也能工作，when。"
          },
          {
            "id": "w4-tue-gr4",
            "type": "choice",
            "question": "It took the scientists years ___ the mission.",
            "options": [
              "to prepare",
              "prepare",
              "preparing",
              "prepared"
            ],
            "answer": 0,
            "explanation_cn": "It takes sb time to do sth：花多年准备。"
          },
          {
            "id": "w4-tue-gr5",
            "type": "choice",
            "question": "The moon is about 380000 kilometres ___ from the earth.",
            "options": [
              "away",
              "far",
              "long",
              "away from"
            ],
            "answer": 0,
            "explanation_cn": "数字 + away：三十八万公里之远。"
          },
          {
            "id": "w4-tue-gr6",
            "type": "choice",
            "question": "Neither the soil ___ the photos can tell us everything.",
            "options": [
              "nor",
              "or",
              "either",
              "and"
            ],
            "answer": 0,
            "explanation_cn": "neither…nor…：土壤和照片都不能告诉我们全部。"
          }
        ]
      },
      {
        "id": "w4-tue-choice",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 10,
        "questions": [
          {
            "id": "w4-tue-mc1",
            "type": "choice",
            "question": "The programme ___ its name from an old story.",
            "options": [
              "took",
              "takes",
              "take",
              "taking"
            ],
            "answer": 0,
            "explanation_cn": "讲述已完成的事实用过去式 took。"
          },
          {
            "id": "w4-tue-mc2",
            "type": "choice",
            "question": "Chang'e-5 ___ the moon in 2020.",
            "options": [
              "reached",
              "reaches",
              "reaching",
              "reach"
            ],
            "answer": 0,
            "explanation_cn": "in 2020 过去时间，用过去式 reached。"
          },
          {
            "id": "w4-tue-mc3",
            "type": "choice",
            "question": "It was the first time that any country ___ moon rocks home in forty years.",
            "options": [
              "had brought",
              "brought",
              "has brought",
              "brings"
            ],
            "answer": 0,
            "explanation_cn": "It was the first time that + 过去完成时：had brought。"
          },
          {
            "id": "w4-tue-mc4",
            "type": "choice",
            "question": "The far side is the side we ___ never see from the earth.",
            "options": [
              "can",
              "cans",
              "may be",
              "are"
            ],
            "answer": 0,
            "explanation_cn": "can 后面用动词原形 see。"
          },
          {
            "id": "w4-tue-mc5",
            "type": "choice",
            "question": "Scientists study the soil ___ how the moon was born.",
            "options": [
              "to learn",
              "learn",
              "learning",
              "learned"
            ],
            "answer": 0,
            "explanation_cn": "目的状语用 to learn。"
          },
          {
            "id": "w4-tue-mc6",
            "type": "choice",
            "question": "A small robot car ___ on the moon and took photos.",
            "options": [
              "drove",
              "drives",
              "driving",
              "driven"
            ],
            "answer": 0,
            "explanation_cn": "and 并列过去动作，drove（drive 的过去式）。"
          },
          {
            "id": "w4-tue-mc7",
            "type": "choice",
            "question": "Chinese astronauts ___ walk on the moon one day.",
            "options": [
              "may",
              "mays",
              "may be",
              "maybe"
            ],
            "answer": 0,
            "explanation_cn": "may + 动词原形：may walk。maybe 是副词，不能加动词。"
          },
          {
            "id": "w4-tue-mc8",
            "type": "choice",
            "question": "The moon travels ___ the earth.",
            "options": [
              "around",
              "round of",
              "around of",
              "to around"
            ],
            "answer": 0,
            "explanation_cn": "月球绕着地球转：travels around the earth。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周三",
    "day_en": "Wednesday",
    "is_speaking_day": true,
    "total_duration": 50,
    "theme_cn": "AI口语 + 高频词汇 + 阅读理解",
    "modules": [
      {
        "id": "w4-wed-speaking",
        "name_cn": "AI口语练习",
        "type": "speaking",
        "duration": 30,
        "questions": [
          {
            "id": "w4-wed-sp1",
            "sentence": "What would you like to do after you finish school?",
            "sentence_cn": "毕业后你想做什么？",
            "options": [
              "I would like to study medicine at university.",
              "I would like to finished my homework.",
              "I finished school last year.",
              "School is interesting."
            ],
            "answer": 0,
            "pronunciation_tips": "would like to 中 would 弱读 /wəd/，medicine /ˈmedsn/ 英式可读两音节",
            "explanation_cn": "would like to + 动词原形 意为想要做。A 正确；B would like to 后面接了过去式，错误；C、D 答非所问。",
            "explanation_en": "'Would like to + base verb' means to want to do. A is correct; B wrongly uses the past form after 'to'; C and D do not answer.",
            "answer_cn_hint": "它在问「毕业后想做什么」（将来的打算），答句要用 would like to / want to 加动词。",
            "options_cn": [
              "我想在大学学医。",
              "我想完成了我的作业。",
              "我去年毕业了。",
              "学校很有趣。"
            ]
          },
          {
            "id": "w4-wed-sp2",
            "sentence": "Tell me about a person you admire.",
            "sentence_cn": "说说你敬佩的一个人。",
            "options": [
              "I admire my PE teacher because he never gives up.",
              "I admire him to run fast.",
              "My PE teacher teaches maths too.",
              "I gave him my book."
            ],
            "answer": 0,
            "pronunciation_tips": "admire /ədˈmaɪə/ 重音在第二音节，gives up 连读",
            "explanation_cn": "A 说出人并给出敬佩的原因（从不放弃），完整。B admire 后面搭配错误；C 只是事实；D 答非所问。",
            "explanation_en": "A names the person and gives the reason ('never gives up'); B uses a wrong pattern after 'admire'; C is just a fact; D does not answer.",
            "answer_cn_hint": "这是请你介绍一个人，答句要说他是谁，再说你敬佩他什么。",
            "options_cn": [
              "我敬佩我的体育老师，因为他从不放弃。",
              "我敬佩他跑得快。",
              "我的体育老师也教数学。",
              "我把书给了他。"
            ]
          },
          {
            "id": "w4-wed-sp3",
            "sentence": "What do you usually do to keep healthy?",
            "sentence_cn": "你平时怎么保持健康？",
            "options": [
              "I run every morning and go to bed early.",
              "I am very healthy.",
              "Health is very important.",
              "My mother cooks healthy food."
            ],
            "answer": 0,
            "pronunciation_tips": "healthy /ˈhelθi/ 注意 th 咬舌，go to bed early 连读",
            "explanation_cn": "how 问做法，A 说出两件具体的事，正确。B 只说状态；C 是观点；D 说的是妈妈。",
            "explanation_en": "'What do you do' asks for actions. A gives two concrete habits; B states a fact about yourself; C is an opinion; D is about mother.",
            "answer_cn_hint": "它在问「怎么保持健康」，答句要说出具体做法，比如跑步、早睡。",
            "options_cn": [
              "我每天早上跑步，而且睡得早。",
              "我很健康。",
              "健康非常重要。",
              "我妈妈做的饭很健康。"
            ]
          },
          {
            "id": "w4-wed-sp4",
            "sentence": "If you could have one superpower, what would it be?",
            "sentence_cn": "如果你能拥有一种超能力，会是什么？",
            "options": [
              "I would like to fly, so I could see the whole world.",
              "I will have a superpower next year.",
              "Superpowers are not real things.",
              "I can run very fast."
            ],
            "answer": 0,
            "pronunciation_tips": "superpower /ˈsuːpəpaʊə/ 复合词重音在前，could /kʊd/ 不要读成 /kʌd/",
            "explanation_cn": "could 开头的虚拟问句，回答用 would。A 正确且补充了理由；B 用了 will，时态不对；C、D 答非所问。",
            "explanation_en": "An imagined situation with 'could' is answered with 'would'. A is correct and adds a reason; B wrongly uses 'will'; C and D do not answer.",
            "answer_cn_hint": "这是假设句，答句要用 I would like to … 说出你想要的超能力，最好再说为什么。",
            "options_cn": [
              "我想飞，这样就能看到整个世界。",
              "我明年会有超能力。",
              "超能力不是真实的东西。",
              "我能跑得很快。"
            ]
          },
          {
            "id": "w4-wed-sp5",
            "sentence": "What was the best trip you have ever taken?",
            "sentence_cn": "你去过最好的一次旅行是什么？",
            "options": [
              "The best trip was to Xi'an with my class.",
              "I will take a trip this summer.",
              "Trips are always tiring.",
              "I take the bus to school."
            ],
            "answer": 0,
            "pronunciation_tips": "have ever taken 注意 taken /ˈteɪkən/ 是 take 的过去分词，Xi'an 读作 /ʃiːˈæn/",
            "explanation_cn": "have ever taken 是完成时，A 回答了最好的一次经历，正确。B 是将来；C 是评价；D 是日常通勤不是旅行。",
            "explanation_en": "A answers with the best trip experience; B is future; C is an opinion; D describes a daily commute, not a trip.",
            "answer_cn_hint": "它在问「最好的一次旅行」，答句要说出去了哪里。",
            "options_cn": [
              "最好的一次旅行是和同学去西安。",
              "今年夏天我要去旅行。",
              "旅行总是很累。",
              "我坐公交车上学。"
            ]
          }
        ]
      },
      {
        "id": "w4-wed-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "soldier",
            "phonetic": "/ˈsəʊldʒə/",
            "meaning": "士兵",
            "emoji": "🪖",
            "example_en": "The soldiers stood on the wall.",
            "example_cn": "士兵们站在城墙上。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🪖",
                  "⭐",
                  "🏯",
                  "🧵"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🧵",
                  "⭐",
                  "🪖",
                  "🏯"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "soldier 是什么意思？（1/2）",
                "options": [
                  "宫殿",
                  "丝绸",
                  "士兵",
                  "贸易"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "soldier 是什么意思？（2/2）",
                "options": [
                  "士兵",
                  "贸易",
                  "宫殿",
                  "丝绸"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: sol__er",
                "answer": "di"
              }
            ],
            "letters": [
              "s",
              "o",
              "l",
              "d",
              "i",
              "e",
              "r"
            ],
            "syllables": [
              "sol",
              "dier"
            ],
            "hint_cn": "穿军装、保卫国家的人"
          },
          {
            "word": "palace",
            "phonetic": "/ˈpæləs/",
            "meaning": "宫殿",
            "emoji": "🏯",
            "example_en": "The palace has a long history.",
            "example_cn": "这座宫殿历史悠久。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🏯",
                  "⭐",
                  "🪖",
                  "🚢"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🚢",
                  "⭐",
                  "🏯",
                  "🪖"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "palace 是什么意思？（1/2）",
                "options": [
                  "士兵",
                  "奇迹",
                  "宫殿",
                  "贸易"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "palace 是什么意思？（2/2）",
                "options": [
                  "宫殿",
                  "贸易",
                  "士兵",
                  "奇迹"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: pal__e",
                "answer": "ac"
              }
            ],
            "letters": [
              "p",
              "a",
              "l",
              "a",
              "c",
              "e"
            ],
            "syllables": [
              "pal",
              "ace"
            ],
            "hint_cn": "古代国王住的那种大房子"
          },
          {
            "word": "silk",
            "phonetic": "/sɪlk/",
            "meaning": "丝绸",
            "emoji": "🧵",
            "example_en": "This scarf is made of silk.",
            "example_cn": "这条围巾是丝绸做的。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🧵",
                  "⭐",
                  "🚗",
                  "🗻"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🗻",
                  "⭐",
                  "🧵",
                  "🚗"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "silk 是什么意思？（1/2）",
                "options": [
                  "宫殿",
                  "贸易",
                  "丝绸",
                  "士兵"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "silk 是什么意思？（2/2）",
                "options": [
                  "丝绸",
                  "士兵",
                  "宫殿",
                  "贸易"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: s__lk",
                "answer": "i"
              }
            ],
            "letters": [
              "s",
              "i",
              "l",
              "k"
            ],
            "syllables": [
              "silk"
            ],
            "hint_cn": "摸起来滑滑的、亮亮的布"
          },
          {
            "word": "trade",
            "phonetic": "/treɪd/",
            "meaning": "贸易；买卖",
            "emoji": "🚢",
            "example_en": "Ships carried goods for trade.",
            "example_cn": "轮船运送货物做贸易。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🚢",
                  "⭐",
                  "🧵",
                  "☂️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "☂️",
                  "⭐",
                  "🚢",
                  "🧵"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "trade 是什么意思？（1/2）",
                "options": [
                  "丝绸",
                  "宫殿",
                  "贸易；买卖",
                  "奇迹"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "trade 是什么意思？（2/2）",
                "options": [
                  "贸易；买卖",
                  "奇迹",
                  "丝绸",
                  "宫殿"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: tr__e",
                "answer": "ad"
              }
            ],
            "letters": [
              "t",
              "r",
              "a",
              "d",
              "e"
            ],
            "syllables": [
              "trade"
            ],
            "hint_cn": "你有我需要的，我有你需要的，换一换"
          },
          {
            "word": "wonder",
            "phonetic": "/ˈwʌndə/",
            "meaning": "奇迹；奇观",
            "emoji": "🗿",
            "example_en": "The Great Wall is a wonder of the world.",
            "example_cn": "长城是世界奇迹之一。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🗿",
                  "⭐",
                  "🚢",
                  "🎲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎲",
                  "⭐",
                  "🗿",
                  "🚢"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "wonder 是什么意思？（1/2）",
                "options": [
                  "贸易",
                  "丝绸",
                  "奇迹；奇观",
                  "宫殿"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "wonder 是什么意思？（2/2）",
                "options": [
                  "奇迹；奇观",
                  "宫殿",
                  "贸易",
                  "丝绸"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: wo__er",
                "answer": "nd"
              }
            ],
            "letters": [
              "w",
              "o",
              "n",
              "d",
              "e",
              "r"
            ],
            "syllables": [
              "won",
              "der"
            ],
            "hint_cn": "看到会“哇”一声的东西，比如长城"
          }
        ]
      },
      {
        "id": "w4-wed-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "C919 is China's first big passenger plane made by itself. The letter C stands for China, and 919 sounds like \"jiu jiu\" in Chinese, which means a long, long time — people hope the plane will fly safely forever. The plane can carry about 160 passengers and fly over five thousand kilometres without stopping. Its first passenger flight was in May 2023, from Shanghai to Beijing. Many parts of the plane, like the wings and the body, are made in Chinese factories. The sky used to belong to planes from other countries, but now China has its own big plane, and it is flying higher and higher.",
        "passage_cn": "C919是中国自主制造的第一架大型客机。字母C代表中国，919在中文里谐音「久久」，寓意长长久久——人们希望这架飞机永远安全飞行。这架飞机可以载约160名乘客，不休息能飞五千多公里。它的首次商业飞行在2023年5月，从上海到北京。飞机的机翼、机身等许多部件都是中国工厂制造的。天空曾经属于别国的飞机，现在中国有了自己的大飞机，而且飞得越来越高。",
        "questions": [
          {
            "id": "w4-wed-rd1",
            "type": "choice",
            "question": "What does the letter C in C919 stand for?",
            "options": [
              "China",
              "Chang'e",
              "Clean",
              "Cloud"
            ],
            "answer": 0,
            "explanation_cn": "字母 C 代表中国（China）。"
          },
          {
            "id": "w4-wed-rd3",
            "type": "choice",
            "question": "How many passengers can C919 carry?",
            "options": [
              "About 160",
              "About 1600",
              "About 16",
              "About 60"
            ],
            "answer": 0,
            "explanation_cn": "可载约160名乘客。"
          },
          {
            "id": "w4-wed-rd5",
            "type": "choice",
            "question": "When was its first passenger flight?",
            "options": [
              "In May 2023",
              "In May 2020",
              "In March 2013",
              "In May 2033"
            ],
            "answer": 0,
            "explanation_cn": "首次商业飞行在2023年5月。"
          },
          {
            "id": "w4-wed-rd10",
            "type": "choice",
            "question": "The best title for the passage about the big plane is ___.",
            "options": [
              "C919, China's Own Big Plane",
              "How to Fly a Plane",
              "A Trip to Shanghai",
              "Planes in the Past"
            ],
            "answer": 0,
            "explanation_cn": "全文介绍国产大飞机C919。"
          }
        ]
      },
      {
        "id": "w4-wed-mc",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 5,
        "questions": [
          {
            "id": "w4-wed-mc1",
            "type": "choice",
            "question": "C919 is China's first big passenger plane ___ by itself.",
            "options": [
              "made",
              "make",
              "makes",
              "making"
            ],
            "answer": 0,
            "explanation_cn": "过去分词 made 作后置定语：中国自主制造的。"
          },
          {
            "id": "w4-wed-mc2",
            "type": "choice",
            "question": "The plane can carry about ___ passengers.",
            "options": [
              "160",
              "1600",
              "16",
              "60"
            ],
            "answer": 0,
            "explanation_cn": "约160名乘客。"
          },
          {
            "id": "w4-wed-mc3",
            "type": "choice",
            "question": "It can fly over five ___ kilometres without stopping.",
            "options": [
              "thousand",
              "thousands",
              "thousand of",
              "thousands of"
            ],
            "answer": 0,
            "explanation_cn": "数词 + thousand 单数：five thousand。"
          },
          {
            "id": "w4-wed-mc4",
            "type": "choice",
            "question": "Its first passenger flight ___ in May 2023.",
            "options": [
              "was",
              "is",
              "were",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "in May 2023 过去时间，用 was。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周四",
    "day_en": "Thursday",
    "is_speaking_day": false,
    "total_duration": 30,
    "theme_cn": "听力练习 + 完形填空 + 时态练习",
    "modules": [
      {
        "id": "w4-thu-listening",
        "name_cn": "听力练习",
        "type": "listening",
        "duration": 10,
        "questions": [
          {
            "id": "w4-thu-ls1",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "The Palace Museum stands in the heart of Beijing.",
            "options": [
              "The Palace Museum stands in the heart of Beijing.",
              "The Palace Museum stands in the south of Beijing.",
              "The Palace Museum stood in the heart of Nanjing.",
              "The Palace Museum stands in the heart of Shanghai."
            ],
            "answer": 0,
            "explanation_cn": "stands（坐落）在北京市中心，不是南方或南京。"
          },
          {
            "id": "w4-thu-ls2",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "The buildings are made of wood without a single nail.",
            "options": [
              "The buildings are made of wood without a single nail.",
              "The buildings are made of stone without a single nail.",
              "The buildings are made of wood with many nails.",
              "The buildings were made of glass without nails."
            ],
            "answer": 0,
            "explanation_cn": "材料是 wood（木头），without a nail（不用钉子）。"
          },
          {
            "id": "w4-thu-ls3",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Over seventeen million people visit it every year.",
            "options": [
              "Over seventeen million people visit it every year.",
              "Over seven million people visit it every year.",
              "Over seventeen million people visited it last year.",
              "Over seventeen million people work there every year."
            ],
            "answer": 0,
            "explanation_cn": "seventeen million（一千七百万），注意 seventeen 和 seven。"
          },
          {
            "id": "w4-thu-ls4",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "People can enjoy the palace without leaving home.",
            "options": [
              "People can enjoy the palace without leaving home.",
              "People can enjoy the palace by leaving home.",
              "People can clean the palace without leaving home.",
              "People can enjoy the park without leaving school."
            ],
            "answer": 0,
            "explanation_cn": "without leaving home（足不出户）。"
          },
          {
            "id": "w4-thu-ls5",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Photos of the red palace in white snow spread quickly online.",
            "options": [
              "Photos of the red palace in white snow spread quickly online.",
              "Photos of the red palace in white snow spread slowly online.",
              "Photos of the old park in white snow spread quickly online.",
              "Photos of the red palace in heavy rain spread quickly online."
            ],
            "answer": 0,
            "explanation_cn": "white snow（白雪）不是 rain；spread quickly（迅速传播）。"
          }
        ]
      },
      {
        "id": "w4-thu-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "The Hong Kong-Zhuhai-Macao Bridge is a wonder of modern engineering. It is the longest sea crossing bridge in the world, with a total 1___ of 55 kilometres. The bridge 2___ Hong Kong, Zhuhai and Macao like a dragon on the sea. Before the bridge, a trip between Hong Kong and Zhuhai 3___ about four hours by road. Now it takes only forty-five 4___. The tunnel in the middle runs 5___ the sea, so big ships can pass above it. Today, thousands of cars cross the bridge every day, and people say it 6___ the three cities into one big family.",
        "questions": [
          {
            "id": "w4-thu-cz1",
            "type": "choice",
            "question": "1___",
            "options": [
              "length",
              "long",
              "longer",
              "longest"
            ],
            "answer": 0,
            "explanation_cn": "a total length of：总长度，用名词 length。"
          },
          {
            "id": "w4-thu-cz2",
            "type": "choice",
            "question": "2___",
            "options": [
              "connects",
              "connect",
              "connected",
              "connecting"
            ],
            "answer": 0,
            "explanation_cn": "主语 the bridge 三单，一般现在时用 connects。"
          },
          {
            "id": "w4-thu-cz3",
            "type": "choice",
            "question": "3___",
            "options": [
              "took",
              "takes",
              "take",
              "taking"
            ],
            "answer": 0,
            "explanation_cn": "before 提示过去，用过去式 took。"
          },
          {
            "id": "w4-thu-cz4",
            "type": "choice",
            "question": "4___",
            "options": [
              "minutes",
              "minute",
              "minutes'",
              "minute's"
            ],
            "answer": 0,
            "explanation_cn": "forty-five minutes：四十五分钟，复数。"
          },
          {
            "id": "w4-thu-cz5",
            "type": "choice",
            "question": "5___",
            "options": [
              "under",
              "on",
              "over",
              "above"
            ],
            "answer": 0,
            "explanation_cn": "海底隧道在海「下面」穿过，under the sea。"
          },
          {
            "id": "w4-thu-cz6",
            "type": "choice",
            "question": "6___",
            "options": [
              "turns",
              "turn",
              "turning",
              "turned"
            ],
            "answer": 0,
            "explanation_cn": "主语 it 三单，turn…into…：把三座城市连成一个大家庭。"
          }
        ]
      },
      {
        "id": "w4-thu-tense",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 10,
        "questions": [
          {
            "id": "w4-thu-tn1",
            "type": "fill",
            "question": "The bridge ___ (open) in October 2018. [填入正确形式]",
            "answer": "opened",
            "explanation_cn": "in October 2018 过去时间，用过去式 opened。"
          },
          {
            "id": "w4-thu-tn2",
            "type": "fill",
            "question": "Look! Cars ___ (cross) the sea bridge now. [填入正确形式]",
            "answer": "are crossing",
            "explanation_cn": "Look! 提示正在进行，用 are crossing。"
          },
          {
            "id": "w4-thu-tn3",
            "type": "fill",
            "question": "The bridge ___ (stand) there for six years. [填入正确形式]",
            "answer": "has stood",
            "explanation_cn": "for six years 与现在完成时连用。"
          },
          {
            "id": "w4-thu-tn4",
            "type": "fill",
            "question": "Workers ___ (build) it for nine years before it opened. [填入正确形式]",
            "answer": "had built",
            "explanation_cn": "通车之前已建了九年，过去完成时 had built。"
          },
          {
            "id": "w4-thu-tn5",
            "type": "fill",
            "question": "A trip ___ (take) only forty-five minutes now. [填入正确形式]",
            "answer": "takes",
            "explanation_cn": "now 一般现在时，主语单数用 takes。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周五",
    "day_en": "Friday",
    "is_speaking_day": false,
    "total_duration": 45,
    "theme_cn": "模板写作 + KET/PET题型 + 语法复习",
    "modules": [
      {
        "id": "w4-fri-writing",
        "name_cn": "写作练习",
        "type": "writing_template",
        "duration": 15,
        "title": "Protecting Our Earth",
        "requirement_cn": "请根据关键词提示完成作文，完成后请背诵全文。明天将进行挖空默写测试！",
        "keywords": [
          "one earth",
          "sort the rubbish",
          "save water",
          "plant trees",
          "better place"
        ],
        "keywords_cn": [
          "一个地球",
          "垃圾分类",
          "节约用水",
          "植树",
          "更好的地方"
        ],
        "template": "We have only {{1}}. At home, we {{2}} every day. We also {{3}} by turning off the tap. Every spring, our class goes to the hills to {{4}}. If everyone does something small, the world will become a {{5}}.",
        "blanks": [
          {
            "id": 1,
            "hint_cn": "一个地球",
            "hint_en": "one earth",
            "answer": "one earth"
          },
          {
            "id": 2,
            "hint_cn": "垃圾分类",
            "hint_en": "sort the rubbish",
            "answer": "sort the rubbish"
          },
          {
            "id": 3,
            "hint_cn": "节约用水",
            "hint_en": "save water",
            "answer": "save water"
          },
          {
            "id": 4,
            "hint_cn": "植树",
            "hint_en": "plant trees",
            "answer": "plant trees"
          },
          {
            "id": 5,
            "hint_cn": "更好的地方",
            "hint_en": "better place",
            "answer": "better place"
          }
        ],
        "full_text": "We have only one earth. At home, we sort the rubbish every day. We also save water by turning off the tap. Every spring, our class goes to the hills to plant trees. If everyone does something small, the world will become a better place.",
        "full_text_cn": "我们只有一个地球。在家里，我们每天做垃圾分类。我们还通过关掉水龙头来节约用水。每年春天，我们班去山上植树。如果每个人做一点小事，世界会变得更美好。",
        "explanation_cn": "这篇作文围绕保护地球展开，使用了5个关键词。注意：1) one earth 一个地球；2) sort the rubbish 垃圾分类；3) save water 节约用水，by + doing 表示方式；4) plant trees 植树；5) a better place 比较级 better 修饰 place。条件句 If everyone does..., the world will... 是主将从现结构。",
        "explanation_en": "This essay is about protecting the earth, using 5 keywords. Notes: 1) 'one earth'; 2) 'sort the rubbish'; 3) 'save water', with 'by + doing' showing the way; 4) 'plant trees'; 5) comparative 'better' before 'place'. The last sentence is a first conditional: present tense after 'if', 'will' in the main clause."
      },
      {
        "id": "w4-fri-ket",
        "name_cn": "KET/PET题型",
        "type": "ket_pet",
        "duration": 10,
        "questions": [
          {
            "id": "w4-fri-kp1",
            "type": "choice",
            "question": "PET: Choose the correct answer. This is the museum ___ we visited last year.",
            "options": [
              "where",
              "which",
              "when",
              "whose"
            ],
            "answer": 1,
            "explanation_cn": "定语从句。visit 是及物动词，缺宾语，先行词是物（museum），用 which/that。where 只能作状语（visited there 就不缺宾语了）。",
            "explanation_en": "Relative clause: 'visited' is missing an object, and the antecedent is a thing, so 'which/that' is used. 'Where' would leave 'visited' without an object."
          },
          {
            "id": "w4-fri-kp2",
            "type": "choice",
            "question": "PET: Choose the correct answer. I ___ getting up early because I run every morning.",
            "options": [
              "am used to",
              "used to",
              "was used to",
              "use to"
            ],
            "answer": 0,
            "explanation_cn": "be used to doing 意为习惯于做某事，to 是介词后面接动名词。used to do 意为过去常常做（现在不做了），意思不同。",
            "explanation_en": "'Be used to doing' means to be accustomed to doing. 'Used to do' means did it in the past but not now — a different meaning."
          },
          {
            "id": "w4-fri-kp3",
            "type": "fill",
            "question": "PET: Complete the sentence. 'The box is so heavy that I can't carry it.' = The box is too heavy ___ me to carry.",
            "answer": "for",
            "explanation_cn": "so...that... 转换为 too...for sb to do。too heavy for me to carry 意为太重了我搬不动。注意 for 引出人。",
            "explanation_en": "'So...that...' becomes 'too...for somebody to do'. Note: 'for' introduces the person."
          },
          {
            "id": "w4-fri-kp4",
            "type": "choice",
            "question": "PET: Choose the correct answer. I don't know ___ to deal with this problem.",
            "options": [
              "how",
              "what",
              "which",
              "why"
            ],
            "answer": 0,
            "explanation_cn": "deal with（处理）的搭配是 how to deal with。what 常和 do with 搭配：what to do with。这两个搭配不要混。",
            "explanation_en": "'Deal with' goes with 'how': how to deal with. 'Do with' goes with 'what'. Don't mix the two pairs."
          },
          {
            "id": "w4-fri-kp5",
            "type": "choice",
            "question": "PET: Choose the correct answer. By the end of last year, they ___ five thousand trees.",
            "options": [
              "planted",
              "had planted",
              "have planted",
              "will plant"
            ],
            "answer": 1,
            "explanation_cn": "by the end of + 过去时间（last year），用过去完成时 had planted。表示到过去某个时间点为止已完成。",
            "explanation_en": "'By the end of + past time' takes the past perfect: 'had planted'. It shows the action was complete before that past point."
          }
        ]
      },
      {
        "id": "w4-fri-grammar",
        "name_cn": "语法复习",
        "type": "grammar",
        "duration": 20,
        "questions": [
          {
            "id": "w4-fri-gr18",
            "type": "choice",
            "question": "Look at the picture. Three ___ are on the floor.（玩具）",
            "options": [
              "toy",
              "toies",
              "toys",
              "toyies"
            ],
            "answer": 2,
            "explanation_cn": "toy 直接加 s：toys。以「元音+y」结尾的词复数直接加 s，不变 ies。",
            "explanation_en": "Toy ends in vowel + y, so the plural is just toys."
          },
          {
            "id": "w4-fri-gr19",
            "type": "choice",
            "question": "The painter needs two ___ .（刷子）",
            "options": [
              "brush",
              "brushs",
              "brushes",
              "brushies"
            ],
            "answer": 2,
            "explanation_cn": "brush 以 sh 结尾，复数加 -es：brushes。s/x/ch/sh 结尾都加 -es。",
            "explanation_en": "Brush ends in -sh, so the plural is brushes."
          },
          {
            "id": "w4-fri-gr20",
            "type": "choice",
            "question": "There are many ___ in the world.（国家）",
            "options": [
              "countrys",
              "country",
              "countryes",
              "countries"
            ],
            "answer": 3,
            "explanation_cn": "country 是「辅音+y」结尾，变 y 为 i 加 es：countries。同类的还有 city→cities。",
            "explanation_en": "Country: consonant + y becomes countries (y → i, add -es)."
          },
          {
            "id": "w4-fri-gr1",
            "type": "fill",
            "question": "School café menu: b__rg__（汉堡）",
            "answer": "burger",
            "explanation_cn": "burger：u 发 /ɜː/，注意别写成 burgur。b-u-r-g-e-r，6 个字母。",
            "explanation_en": "Burger: the vowel is u, spelled b-u-r-g-e-r."
          },
          {
            "id": "w4-fri-gr2",
            "type": "fill",
            "question": "School café menu: ch__ps（薯条）",
            "answer": "chips",
            "explanation_cn": "chips 是 chip 的复数，直接加 s。注意和 French fries 是同一种东西的不同说法。",
            "explanation_en": "Chips is the plural of chip: just add -s."
          },
          {
            "id": "w4-fri-gr3",
            "type": "fill",
            "question": "School café menu: s__dw__ch__s（三明治（复数））",
            "answer": "sandwiches",
            "explanation_cn": "sandwich 以 ch 结尾，复数要加 -es：sandwiches。注意中间是 d-w-i。",
            "explanation_en": "Sandwich ends in -ch, so the plural adds -es: sandwiches."
          },
          {
            "id": "w4-fri-gr4",
            "type": "fill",
            "question": "School café menu: f_sh __nd ch__ps（炸鱼薯条）",
            "answer": "fish and chips",
            "explanation_cn": "英国名菜「炸鱼薯条」：fish and chips，三个词中间用 and 连接。",
            "explanation_en": "Fish and chips: a famous British dish, three words joined by \"and\"."
          },
          {
            "id": "w4-fri-gr5",
            "type": "fill",
            "question": "School café menu: ch_ck_n s_l_d（鸡肉沙拉）",
            "answer": "chicken salad",
            "explanation_cn": "chicken 的 ck 在中间别漏；salad 的第二个 a 发 /ə/。",
            "explanation_en": "Chicken salad: don't miss the -ck- in chicken."
          },
          {
            "id": "w4-fri-gr6",
            "type": "fill",
            "question": "School café menu: __pl_s（苹果（复数））",
            "answer": "apples",
            "explanation_cn": "apple 复数加 s：apples。开头是两个 p：a-p-p-l-e-s。",
            "explanation_en": "Apples: apple with two p's, plural adds -s."
          },
          {
            "id": "w4-fri-gr7",
            "type": "fill",
            "question": "School café menu: b_n_n_s（香蕉（复数））",
            "answer": "bananas",
            "explanation_cn": "banana 有三个 a，复数直接加 s：bananas。",
            "explanation_en": "Bananas: banana has three a's; plural just adds -s."
          },
          {
            "id": "w4-fri-gr8",
            "type": "fill",
            "question": "School café menu: __c__ cr__m（冰淇淋）",
            "answer": "ice cream",
            "explanation_cn": "ice cream 是两个词，中间有空格：i-c-e c-r-e-a-m。",
            "explanation_en": "Ice cream is two words: ice + cream."
          },
          {
            "id": "w4-fri-gr9",
            "type": "fill",
            "question": "School café menu: __r_ng_ j__c_（橙汁）",
            "answer": "orange juice",
            "explanation_cn": "orange 和 juice 都是常见词，合起来是橙汁，中间空格。",
            "explanation_en": "Orange juice: two words, orange + juice."
          },
          {
            "id": "w4-fri-gr10",
            "type": "fill",
            "question": "School café menu: l_m_n_d_（柠檬水）",
            "answer": "lemonade",
            "explanation_cn": "lemonade 结尾是 -ade，重音在最后一个音节 /ˌleməˈneɪd/。",
            "explanation_en": "Lemonade ends in -ade, stress on the last syllable."
          },
          {
            "id": "w4-fri-gr11",
            "type": "fill",
            "question": "Pass me a ___ of bread.（一条面包）",
            "answer": "loaf",
            "explanation_cn": "一条（条状的）面包用 a loaf of bread。复数 loaves：two loaves of bread。",
            "explanation_en": "A loaf of bread. Plural: loaves (f → ves)."
          },
          {
            "id": "w4-fri-gr12",
            "type": "fill",
            "question": "She put a ___ of chocolate into her pocket.（一块巧克力）",
            "answer": "bar",
            "explanation_cn": "一块（条状）巧克力用 a bar of chocolate，也可以 a bar of soap（一块肥皂）。",
            "explanation_en": "A bar of chocolate."
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周六",
    "day_en": "Saturday",
    "is_speaking_day": true,
    "total_duration": 50,
    "theme_cn": "AI口语 + 高频词汇 + 阅读理解",
    "modules": [
      {
        "id": "w4-sat-speaking",
        "name_cn": "AI口语练习",
        "type": "speaking",
        "duration": 30,
        "questions": [
          {
            "id": "w4-sat-sp1",
            "sentence": "What advice would you give to a friend who is nervous before a test?",
            "sentence_cn": "朋友考试前紧张，你会给他什么建议？",
            "options": [
              "I would tell him to take a deep breath and believe in himself.",
              "I will tell him that tests are easy.",
              "I told him to study harder last week.",
              "He is always nervous about tests."
            ],
            "answer": 0,
            "pronunciation_tips": "advice /ədˈvaɪs/ 名词重音在后，注意和动词 advise 的读音区别；breath /breθ/ 咬舌",
            "explanation_cn": "would give 表示虚拟建议，A 用 would tell him to do 结构，正确。B 应该是 I would tell；C 是过去的事不是建议；D 只是描述。",
            "explanation_en": "The imagined advice uses 'would': A is correct. B should also use 'would'; C reports the past, not advice; D just describes.",
            "answer_cn_hint": "它在问「你会给什么建议」，答句要用 I would tell him to … 说出一个建议。",
            "options_cn": [
              "我会告诉他深呼吸，相信自己。",
              "我会告诉他考试很简单。",
              "我上周告诉他要更努力学习。",
              "他考试总是很紧张。"
            ]
          },
          {
            "id": "w4-sat-sp2",
            "sentence": "Do you prefer reading books or watching films?",
            "sentence_cn": "你喜欢看书还是看电影？",
            "options": [
              "I prefer books because I can imagine the pictures myself.",
              "I prefer to watch TV at home.",
              "I watched a film last night.",
              "Books and films are both cheap."
            ],
            "answer": 0,
            "pronunciation_tips": "prefer /prɪˈfɜː/ 重音在第二音节，imagine /ɪˈmædʒɪn/",
            "explanation_cn": "prefer A to B / prefer doing 表示更喜欢。问二选一，A 明确选了书并给出原因，正确。B 换成了电视没有二选一；C、D 答非所问。",
            "explanation_en": "The question asks to choose between two things. A chooses books and gives a reason; B answers with a third thing; C and D do not answer.",
            "answer_cn_hint": "这是二选一，答句要先说你选哪一个，再说理由（because…）。",
            "options_cn": [
              "我更喜欢看书，因为我可以自己想象画面。",
              "我更喜欢在家看电视。",
              "我昨晚看了一部电影。",
              "书和电影都很便宜。"
            ]
          },
          {
            "id": "w4-sat-sp3",
            "sentence": "What is the most important thing you have learned at school?",
            "sentence_cn": "你在学校学到的最重要的东西是什么？",
            "options": [
              "Learning how to learn is the most important thing.",
              "I learned English for six years.",
              "The school building is very old.",
              "I have learned to be on time."
            ],
            "answer": 0,
            "pronunciation_tips": "important /ɪmˈpɔːtnt/ 注意重音，learned 此处作动词过去分词读 /lɜːnd/",
            "explanation_cn": "A 用动名词短语作主语回答最重要的东西，正确且深刻。B 只是学了多久；C 答非所问；D 说的是学到的一件事但题目问最重要，D 也可算答但 A 直接呼应最高级 the most important，最佳。",
            "explanation_en": "A answers with the superlative directly ('the most important thing'); B only gives a duration; C is off topic; D gives an example but A matches the question best.",
            "answer_cn_hint": "它在问「最重要的一样东西」，答句要说出一样具体的收获。",
            "options_cn": [
              "学会怎么学习是最重要的。",
              "我学了六年英语。",
              "学校的楼很旧。",
              "我学会了守时。"
            ]
          },
          {
            "id": "w4-sat-sp4",
            "sentence": "How can we help old people in our community?",
            "sentence_cn": "我们能怎样帮助社区里的老人？",
            "options": [
              "We can visit them and help them carry things.",
              "Old people like talking about the past.",
              "Our community is very big.",
              "They usually get up early."
            ],
            "answer": 0,
            "pronunciation_tips": "community /kəˈmjuːnəti/ 重音在第二音节，help them 中 them 常弱读 /ðəm/",
            "explanation_cn": "how 问方法，A 说出两件具体能做的事，正确。B、C、D 都是描述性陈述，没有回答怎么帮。",
            "explanation_en": "'How' asks for a way. A gives two concrete actions; B, C and D are statements that do not answer.",
            "answer_cn_hint": "它在问「怎样帮助老人」，答句要用 We can … 说出具体做法。",
            "options_cn": [
              "我们可以去看望他们，帮他们拿东西。",
              "老人喜欢谈过去的事。",
              "我们的社区很大。",
              "他们通常起得很早。"
            ]
          },
          {
            "id": "w4-sat-sp5",
            "sentence": "If you could travel to any country, where would you go?",
            "sentence_cn": "如果你能去任何国家旅行，你会去哪里？",
            "options": [
              "I would go to Egypt to see the pyramids.",
              "I will go to Egypt next month.",
              "I went to Egypt with my parents.",
              "Egypt is in Africa."
            ],
            "answer": 0,
            "pronunciation_tips": "Egypt /ˈiːdʒɪpt/ 注意开头是长元音 iː，pyramids /ˈpɪrəmɪdz/",
            "explanation_cn": "could 虚拟提问，回答用 would，A 正确并说明原因。B 是真实计划用 will；C 是过去事实；D 是地理常识，答非所问。",
            "explanation_en": "The imagined 'could' question is answered with 'would'. A is correct with a reason; B is a real plan; C is a past fact; D does not answer.",
            "answer_cn_hint": "这是假设句，答句要用 I would go to … 说出一个地方。",
            "options_cn": [
              "我想去埃及看金字塔。",
              "我下个月要去埃及。",
              "我和父母去过埃及。",
              "埃及在非洲。"
            ]
          }
        ]
      },
      {
        "id": "w4-sat-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "pyramid",
            "phonetic": "/ˈpɪrəmɪd/",
            "meaning": "金字塔",
            "emoji": "🔺",
            "example_en": "The pyramids are in Egypt.",
            "example_cn": "金字塔在埃及。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🔺",
                  "⭐",
                  "🐪",
                  "❓"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "❓",
                  "⭐",
                  "🔺",
                  "🐪"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "pyramid 是什么意思？（1/2）",
                "options": [
                  "骆驼",
                  "沙漠",
                  "金字塔",
                  "之谜"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "pyramid 是什么意思？（2/2）",
                "options": [
                  "金字塔",
                  "之谜",
                  "骆驼",
                  "沙漠"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: py__mid",
                "answer": "ra"
              }
            ],
            "letters": [
              "p",
              "y",
              "r",
              "a",
              "m",
              "i",
              "d"
            ],
            "syllables": [
              "pyr",
              "a",
              "mid"
            ],
            "hint_cn": "埃及那种尖尖的、三角形的大石头建筑"
          },
          {
            "word": "desert",
            "phonetic": "/ˈdezət/",
            "meaning": "沙漠",
            "emoji": "🐪",
            "example_en": "Camels live in the desert.",
            "example_cn": "骆驼生活在沙漠里。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🐪",
                  "⭐",
                  "🔺",
                  "🧭"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🧭",
                  "⭐",
                  "🐪",
                  "🔺"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "desert 是什么意思？（1/2）",
                "options": [
                  "金字塔",
                  "之谜",
                  "沙漠",
                  "导游"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "desert 是什么意思？（2/2）",
                "options": [
                  "沙漠",
                  "导游",
                  "金字塔",
                  "之谜"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: des__t",
                "answer": "er"
              }
            ],
            "letters": [
              "d",
              "e",
              "s",
              "e",
              "r",
              "t"
            ],
            "syllables": [
              "des",
              "ert"
            ],
            "hint_cn": "全是沙子、很少下雨的地方"
          },
          {
            "word": "camel",
            "phonetic": "/ˈkæml/",
            "meaning": "骆驼",
            "emoji": "🐫",
            "example_en": "The camel is called the ship of the desert.",
            "example_cn": "骆驼被称为沙漠之舟。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🐫",
                  "⭐",
                  "🏜️",
                  "☂️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "☂️",
                  "⭐",
                  "🐫",
                  "🏜️"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "camel 是什么意思？（1/2）",
                "options": [
                  "沙漠",
                  "金字塔",
                  "骆驼",
                  "导游"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "camel 是什么意思？（2/2）",
                "options": [
                  "骆驼",
                  "导游",
                  "沙漠",
                  "金字塔"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: cam__l",
                "answer": "e"
              }
            ],
            "letters": [
              "c",
              "a",
              "m",
              "e",
              "l"
            ],
            "syllables": [
              "cam",
              "el"
            ],
            "hint_cn": "背上有鼓包，能在沙子里走很久"
          },
          {
            "word": "mystery",
            "phonetic": "/ˈmɪstri/",
            "meaning": "谜；神秘的事物",
            "emoji": "❓",
            "example_en": "The old house is full of mystery.",
            "example_cn": "那座老房子充满神秘。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "❓",
                  "⭐",
                  "🚢",
                  "🎲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎲",
                  "⭐",
                  "❓",
                  "🚢"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "mystery 是什么意思？（1/2）",
                "options": [
                  "导游",
                  "沙漠",
                  "谜；神秘的事物",
                  "骆驼"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "mystery 是什么意思？（2/2）",
                "options": [
                  "谜；神秘的事物",
                  "骆驼",
                  "导游",
                  "沙漠"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: mys__ry",
                "answer": "te"
              }
            ],
            "letters": [
              "m",
              "y",
              "s",
              "t",
              "e",
              "r",
              "y"
            ],
            "syllables": [
              "mys",
              "te",
              "ry"
            ],
            "hint_cn": "想不明白、还等着人去解开的事"
          },
          {
            "word": "guide",
            "phonetic": "/ɡaɪd/",
            "meaning": "导游；指南",
            "emoji": "🧭",
            "example_en": "The guide showed us around the city.",
            "example_cn": "导游带我们游览了这座城市。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🧭",
                  "⭐",
                  "❓",
                  "🎸"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎸",
                  "⭐",
                  "🧭",
                  "❓"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "guide 是什么意思？（1/2）",
                "options": [
                  "之谜",
                  "骆驼",
                  "导游；指南",
                  "沙漠"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "guide 是什么意思？（2/2）",
                "options": [
                  "导游；指南",
                  "沙漠",
                  "之谜",
                  "骆驼"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: g__de",
                "answer": "ui"
              }
            ],
            "letters": [
              "g",
              "u",
              "i",
              "d",
              "e"
            ],
            "syllables": [
              "guide"
            ],
            "hint_cn": "带你逛、给你讲的那个人"
          }
        ]
      },
      {
        "id": "w4-sat-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "Paper cutting is one of China's oldest folk arts, and it is now becoming popular around the world. With only a pair of scissors and a piece of red paper, artists can make wonderful pictures of flowers, animals and people. In the north of China, people still put paper cuttings on windows during the Spring Festival, because the red colour means good luck. In 2009, Chinese paper cutting was added to the world intangible cultural heritage list. Today, paper cutting artists teach in schools and even online, and short videos of their hands moving quickly get millions of likes. Paper cutting connects the past and the present, the old and the young, China and the world.",
        "passage_cn": "剪纸是中国最古老的民间艺术之一，如今正在世界范围内流行。艺术家只用一把剪刀和一张红纸，就能剪出花草、动物和人像。在中国北方，春节时人们仍然把剪纸贴在窗上，因为红色代表好运。2009年，中国剪纸被列入世界非物质文化遗产名录。如今，剪纸艺人走进学校，甚至在网上教学，他们灵巧双手的短视频获得数百万点赞。」剪纸连接着过去与现在、老人与孩子、中国与世界。",
        "questions": [
          {
            "id": "w4-sat-rd1",
            "type": "choice",
            "question": "What do artists need to make paper cuttings?",
            "options": [
              "Scissors and a piece of red paper",
              "A knife and a board",
              "A computer",
              "Paints and brushes"
            ],
            "answer": 0,
            "explanation_cn": "一把剪刀和一张红纸即可。"
          },
          {
            "id": "w4-sat-rd2",
            "type": "choice",
            "question": "Where do people put paper cuttings during the Spring Festival?",
            "options": [
              "On windows",
              "On doors only",
              "On cars",
              "On beds"
            ],
            "answer": 0,
            "explanation_cn": "北方春节时把剪纸贴在窗上。"
          },
          {
            "id": "w4-sat-rd4",
            "type": "choice",
            "question": "When was paper cutting added to the world heritage list?",
            "options": [
              "In 2009",
              "In 1999",
              "In 2019",
              "In 2020"
            ],
            "answer": 0,
            "explanation_cn": "2009年列入世界非遗名录。"
          },
          {
            "id": "w4-sat-rd10",
            "type": "choice",
            "question": "The best title for the passage about red paper art is ___.",
            "options": [
              "Paper Cutting Wins the World",
              "How to Use Scissors",
              "Red Windows in Winter",
              "Artists in France"
            ],
            "answer": 0,
            "explanation_cn": "全文讲剪纸从中国走向世界。"
          }
        ]
      },
      {
        "id": "w4-sat-mc",
        "name_cn": "单项选择",
        "type": "multiple_choice",
        "duration": 5,
        "questions": [
          {
            "id": "w4-sat-mc1",
            "type": "choice",
            "question": "Paper cutting is one of China's oldest ___ arts.",
            "options": [
              "folk",
              "fool",
              "full",
              "fall"
            ],
            "answer": 0,
            "explanation_cn": "folk art 民间艺术，注意 folk 不是 fool（傻瓜）。"
          },
          {
            "id": "w4-sat-mc2",
            "type": "choice",
            "question": "Artists can make wonderful pictures ___ red paper.",
            "options": [
              "with",
              "in",
              "at",
              "on"
            ],
            "answer": 0,
            "explanation_cn": "「用红纸」做，工具用 with。"
          },
          {
            "id": "w4-sat-mc3",
            "type": "choice",
            "question": "People put paper cuttings ___ windows during the festival.",
            "options": [
              "on",
              "in",
              "at",
              "under"
            ],
            "answer": 0,
            "explanation_cn": "贴「在窗上」用 on windows。"
          },
          {
            "id": "w4-sat-mc4",
            "type": "choice",
            "question": "Red ___ good luck in Chinese culture.",
            "options": [
              "means",
              "mean",
              "meaning",
              "meant"
            ],
            "answer": 0,
            "explanation_cn": "主语 red（红色）三单，用 means。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周日",
    "day_en": "Sunday",
    "is_speaking_day": false,
    "total_duration": 20,
    "theme_cn": "阅读理解 + 高频词汇 + 完形填空",
    "modules": [
      {
        "id": "w4-sun-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          {
            "word": "sight",
            "phonetic": "/saɪt/",
            "meaning": "视力",
            "emoji": "👁️",
            "example_en": "The illness took away her sight.",
            "example_cn": "疾病夺走了她的视力。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "👁️",
                  "⭐",
                  "🤫",
                  "🤒"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🤒",
                  "⭐",
                  "👁️",
                  "🤫"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "sight 是什么意思？（1/2）",
                "options": [
                  "安静的",
                  "疾病",
                  "视力",
                  "勇气"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "sight 是什么意思？（2/2）",
                "options": [
                  "视力",
                  "勇气",
                  "安静的",
                  "疾病"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: s__ht",
                "answer": "ig"
              }
            ],
            "letters": [
              "s",
              "i",
              "g",
              "h",
              "t"
            ],
            "syllables": [
              "sight"
            ],
            "hint_cn": "用眼睛看东西的能力"
          },
          {
            "word": "silent",
            "phonetic": "/ˈsaɪlənt/",
            "meaning": "寂静的；沉默的",
            "emoji": "🤫",
            "example_en": "The room was silent.",
            "example_cn": "房间里一片寂静。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🤫",
                  "⭐",
                  "🎓",
                  "🎲"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🎲",
                  "⭐",
                  "🤫",
                  "🎓"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "silent 是什么意思？（1/2）",
                "options": [
                  "大学",
                  "视力",
                  "寂静的；沉默的",
                  "疾病"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "silent 是什么意思？（2/2）",
                "options": [
                  "寂静的；沉默的",
                  "疾病",
                  "大学",
                  "视力"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: si__nt",
                "answer": "le"
              }
            ],
            "letters": [
              "s",
              "i",
              "l",
              "e",
              "n",
              "t"
            ],
            "syllables": [
              "si",
              "lent"
            ],
            "hint_cn": "一点点声音都没有"
          },
          {
            "word": "courage",
            "phonetic": "/ˈkʌrɪdʒ/",
            "meaning": "勇气",
            "emoji": "🦁",
            "example_en": "She had the courage to try again.",
            "example_cn": "她有勇气再试一次。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🦁",
                  "⭐",
                  "👁️",
                  "☂️"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "☂️",
                  "⭐",
                  "🦁",
                  "👁️"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "courage 是什么意思？（1/2）",
                "options": [
                  "视力",
                  "寂静的",
                  "勇气",
                  "大学"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "courage 是什么意思？（2/2）",
                "options": [
                  "勇气",
                  "大学",
                  "视力",
                  "寂静的"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: cou__ge",
                "answer": "ra"
              }
            ],
            "letters": [
              "c",
              "o",
              "u",
              "r",
              "a",
              "g",
              "e"
            ],
            "syllables": [
              "cour",
              "age"
            ],
            "hint_cn": "心里有点怕，但还是敢去做"
          },
          {
            "word": "university",
            "phonetic": "/ˌjuːnɪˈvɜːsəti/",
            "meaning": "大学",
            "emoji": "🎓",
            "example_en": "She went to university at eighteen.",
            "example_cn": "她十八岁上了大学。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🎓",
                  "⭐",
                  "🤫",
                  "🚗"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🚗",
                  "⭐",
                  "🎓",
                  "🤫"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "university 是什么意思？（1/2）",
                "options": [
                  "勇气",
                  "寂静的",
                  "大学",
                  "疾病"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "university 是什么意思？（2/2）",
                "options": [
                  "大学",
                  "疾病",
                  "勇气",
                  "寂静的"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: univer__ty",
                "answer": "si"
              }
            ],
            "letters": [
              "u",
              "n",
              "i",
              "v",
              "e",
              "r",
              "s",
              "i",
              "t",
              "y"
            ],
            "syllables": [
              "u",
              "ni",
              "ver",
              "si",
              "ty"
            ],
            "hint_cn": "读完中学以后去读书的地方"
          },
          {
            "word": "disease",
            "phonetic": "/dɪˈziːz/",
            "meaning": "疾病",
            "emoji": "🤒",
            "example_en": "Washing hands helps stop disease.",
            "example_cn": "洗手有助于预防疾病。",
            "stages": [
              {
                "type": "learn",
                "instruction": "看图学单词"
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（1/2）",
                "options": [
                  "🤒",
                  "⭐",
                  "🎓",
                  "🦁"
                ],
                "answer": 0
              },
              {
                "type": "image_choice",
                "prompt": "听发音，选图片（2/2）",
                "options": [
                  "🦁",
                  "⭐",
                  "🤒",
                  "🎓"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "disease 是什么意思？（1/2）",
                "options": [
                  "大学",
                  "视力",
                  "疾病",
                  "勇气"
                ],
                "answer": 2
              },
              {
                "type": "meaning_choice",
                "prompt": "disease 是什么意思？（2/2）",
                "options": [
                  "疾病",
                  "勇气",
                  "大学",
                  "视力"
                ],
                "answer": 0
              },
              {
                "type": "letter_read",
                "prompt": "跟读字母（每个字母读两遍）"
              },
              {
                "type": "syllable_blend",
                "prompt": "拼合音标（每个音节读两遍）"
              },
              {
                "type": "spell_fill",
                "prompt": "补全拼写: dis__se",
                "answer": "ea"
              }
            ],
            "letters": [
              "d",
              "i",
              "s",
              "e",
              "a",
              "s",
              "e"
            ],
            "syllables": [
              "di",
              "ease"
            ],
            "hint_cn": "让人生病、身体不舒服的东西"
          }
        ]
      },
      {
        "id": "w4-sun-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "Chinese characters are one of the oldest writing systems in the world. People wrote on oracle bones more than 3000 years 1___. In old times, characters looked like the things they stood 2___. For example, the character for \"mountain\" looked like three 3___, and \"sun\" was a circle with a dot. Today, Chinese people write with pens and 4___, but the old shapes are still easy to see. There are more than 50000 characters in all, 5___ people only use a few thousand in daily life. Chinese characters carry the history of 5000 years, and they will keep 6___ for the next 5000 years.",
        "questions": [
          {
            "id": "w4-sun-cz1",
            "type": "choice",
            "question": "1___",
            "options": [
              "ago",
              "before",
              "later",
              "after"
            ],
            "answer": 0,
            "explanation_cn": "「三千多年前」，时间 + ago。"
          },
          {
            "id": "w4-sun-cz2",
            "type": "choice",
            "question": "2___",
            "options": [
              "for",
              "at",
              "up",
              "with"
            ],
            "answer": 0,
            "explanation_cn": "stand for：代表，固定短语。"
          },
          {
            "id": "w4-sun-cz3",
            "type": "choice",
            "question": "3___",
            "options": [
              "peaks",
              "peak",
              "peaks'",
              "the peaks"
            ],
            "answer": 0,
            "explanation_cn": "「山」字像三个山峰，three peaks 复数。"
          },
          {
            "id": "w4-sun-cz4",
            "type": "choice",
            "question": "4___",
            "options": [
              "keyboards",
              "keyboard's",
              "keyboard",
              "a keyboard"
            ],
            "answer": 0,
            "explanation_cn": "pens and keyboards：笔和键盘，并列复数。"
          },
          {
            "id": "w4-sun-cz5",
            "type": "choice",
            "question": "5___",
            "options": [
              "but",
              "and",
              "so",
              "or"
            ],
            "answer": 0,
            "explanation_cn": "「有五万多字，但日常只用到几千个」，but 转折。"
          },
          {
            "id": "w4-sun-cz6",
            "type": "choice",
            "question": "6___",
            "options": [
              "growing",
              "grow",
              "grows",
              "grew"
            ],
            "answer": 0,
            "explanation_cn": "keep doing sth：keep growing 继续生长。"
          }
        ]
      },
      {
        "id": "w4-sun-listening",
        "name_cn": "听力练习",
        "type": "listening",
        "duration": 5,
        "questions": [
          {
            "id": "w4-sun-ls1",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "People wrote on oracle bones more than 3000 years ago.",
            "options": [
              "People wrote on oracle bones more than 3000 years ago.",
              "People wrote on paper more than 3000 years ago.",
              "People wrote on oracle bones more than 300 years ago.",
              "People draw on oracle bones more than 3000 years ago."
            ],
            "answer": 0,
            "explanation_cn": "oracle bones（甲骨），时间 3000 多年前。"
          },
          {
            "id": "w4-sun-ls2",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "There are more than 50000 characters in all.",
            "options": [
              "There are more than 50000 characters in all.",
              "There are more than 5000 characters in all.",
              "There are more than 50000 words in all.",
              "There were more than 50000 characters in all."
            ],
            "answer": 0,
            "explanation_cn": "数字 50000（五万），in all（总共）。"
          },
          {
            "id": "w4-sun-ls3",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "The character for mountain looked like three peaks.",
            "options": [
              "The character for mountain looked like three peaks.",
              "The character for water looked like three peaks.",
              "The character for mountain looks like three lines.",
              "The word for mountain looked like three peaks."
            ],
            "answer": 0,
            "explanation_cn": "「山」字像三个山峰，looked like（过去像）。"
          },
          {
            "id": "w4-sun-ls4",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "Calligraphy is the art of writing characters.",
            "options": [
              "Calligraphy is the art of writing characters.",
              "Calligraphy is the game of writing characters.",
              "Calligraphy is the art of drawing pictures.",
              "Photography is the art of writing characters."
            ],
            "answer": 0,
            "explanation_cn": "calligraphy（书法）是写字的艺术，不是游戏或画画。"
          },
          {
            "id": "w4-sun-ls5",
            "type": "choice",
            "question": "Which sentence do you hear?",
            "audio_text": "With a brush and ink, the characters can dance on the paper.",
            "options": [
              "With a brush and ink, the characters can dance on the paper.",
              "With a pen and ink, the characters can dance on the paper.",
              "With a brush and ink, the children can dance on the paper.",
              "With a brush and ink, the characters can dance on the wall."
            ],
            "answer": 0,
            "explanation_cn": "工具是 brush and ink（毛笔和墨），地点 on the paper。"
          }
        ]
      }
    ]
  }
];

// ===== v157：WEEK5（2026-10-26 起）======================================
// 由 tools/apply-v157-week5.js 生成：W4 骨架 + 砍短的文章 + 全新周五写作。
// 家长红线：跟读句子要短（阅读每句 ≤14 词、完形 ≤13 词），难度不再逐周爬坡。
const WEEK5 = [{"day_cn":"周一","day_en":"Monday","is_speaking_day":true,"total_duration":50,"theme_cn":"AI口语 + 高频词汇 + 阅读理解","modules":[{"id":"w5-mon-speaking","name_cn":"AI口语练习","type":"speaking","duration":30,"questions":[{"id":"w5-mon-sp1","sentence":"What would you do if you won a big prize?","sentence_cn":"如果你赢得大奖，你会做什么？","options":["If I won a big prize, I would travel around the world.","If I will win a prize, I am happy.","I won a prize last year.","Prizes are for children."],"answer":0,"pronunciation_tips":"虚拟语气 would /wʊd/ 不要读成 will，won /wʌn/ 和 one 同音","explanation_cn":"对将来的假设用虚拟语气：If I won..., I would...。从句用过去式，主句用 would + 动词原形。B 时态搭配错误。","explanation_en":"For an imagined future, use the second conditional: 'If I won..., I would...'. The if-clause uses the past form and the main clause uses 'would + base verb'. B mixes the tenses wrongly.","answer_cn_hint":"这是假设句，答句要用 If … I would … 说出你会做的事。","options_cn":["如果我赢了大奖，我会环游世界。","如果我将会得奖，我很开心。","我去年得过一次奖。","奖品是给小朋友的。"]},{"id":"w5-mon-sp2","sentence":"Do you think students should wear uniforms?","sentence_cn":"你认为学生应该穿校服吗？","options":["Yes, I think uniforms make us look neat.","Yes, I am wearing a uniform now.","Uniforms are made of cotton.","My uniform is too big for me."],"answer":0,"pronunciation_tips":"uniform /ˈjuːnɪfɔːm/ 注意 u 读 /juː/，should 词尾 d 不发音","explanation_cn":"问观点，回答要给出看法和理由。A 正确（neat 整洁的）；B 说的是正在穿；C、D 答非所问。","explanation_en":"The question asks for an opinion, so give a view with a reason. A does ('neat' means tidy); B says what you are wearing now; C and D do not answer.","answer_cn_hint":"这是在问你的看法，答句要先说 Yes/No 或者 I think…，再说一句理由。","options_cn":["是的，我认为校服让我们看起来整洁。","是的，我现在穿着校服。","校服是棉花做的。","我的校服对我来说太大了。"]},{"id":"w5-mon-sp3","sentence":"What is the most useful invention in your life?","sentence_cn":"你生活中最有用的发明是什么？","options":["I think the most useful invention is the mobile phone.","I invented a paper plane yesterday.","Inventions are interesting.","My phone is new."],"answer":0,"pronunciation_tips":"invention /ɪnˈvenʃn/ 注意重音在第二音节，most useful 连读","explanation_cn":"A 用最高级 the most useful 回答最有用，正确。B 说的是自己发明东西；C、D 答非所问。","explanation_en":"A answers with the superlative 'the most useful'; B talks about making something yourself; C and D do not answer.","answer_cn_hint":"它在问「哪个发明」，答句要说出一样东西，比如手机、电灯。","options_cn":["我认为最有用的发明是手机。","我昨天发明了一架纸飞机。","发明很有趣。","我的手机是新的。"]},{"id":"w5-mon-sp4","sentence":"How do you protect the environment at home?","sentence_cn":"你在家怎么保护环境？","options":["We sort the rubbish and save water at home.","The environment is very important.","My home is near a park.","There is a lot of pollution outside."],"answer":0,"pronunciation_tips":"environment /ɪnˈvaɪrənmənt/ 音节多，注意中间 /raɪn/，sort /sɔːt/","explanation_cn":"how 问方法，A 说出具体做法（垃圾分类、节约用水），正确。B 是观点；C、D 答非所问。","explanation_en":"'How' asks for a way or method. A gives concrete actions (sorting rubbish, saving water); B is an opinion; C and D do not answer.","answer_cn_hint":"它在问「怎么保护环境」，答句要说出具体做法，比如垃圾分类、节约用水。","options_cn":["我们在家给垃圾分类，还节约用水。","环境非常重要。","我家在一个公园附近。","外面污染很严重。"]},{"id":"w5-mon-sp5","sentence":"Which subject do you find the most difficult?","sentence_cn":"你觉得哪门科目最难？","options":["Maths. But I am getting better at it.","I find my maths book on the desk.","Maths is my first class today.","I like all the teachers."],"answer":0,"pronunciation_tips":"difficult /ˈdɪfɪkəlt/ 注意中间的 k 音，maths 词尾 ths 咬舌","explanation_cn":"A 说出科目并补充自己在进步，正确。B find 在这里是发现的意思被误解为找到；C、D 答非所问。","explanation_en":"A names the subject and adds progress; B misunderstands 'find' (here it means to think something is hard, not to locate); C and D do not answer.","answer_cn_hint":"Which 是在几门科目里选一门，答句要说出科目名，再加上一句感受。","options_cn":["数学。不过我在进步。","我在书桌上找到了我的数学书。","数学是我今天的第一节课。","我喜欢所有的老师。"]}]},{"id":"w5-mon-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"invent","phonetic":"/ɪnˈvent/","meaning":"发明","emoji":"💡","example_en":"Who invented the telephone?","example_cn":"谁发明了电话？","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["💡","⭐","🔬","♻️"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["♻️","⭐","💡","🔬"],"answer":2},{"type":"meaning_choice","prompt":"invent 是什么意思？（1/2）","options":["实验","回收利用","发明","污染"],"answer":2},{"type":"meaning_choice","prompt":"invent 是什么意思？（2/2）","options":["发明","污染","实验","回收利用"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: in__nt","answer":"ve"}],"letters":["i","n","v","e","n","t"],"syllables":["in","vent"],"hint_cn":"想出一个新东西，以前从来没有过"},{"word":"experiment","phonetic":"/ɪkˈsperɪmənt/","meaning":"实验","emoji":"🔬","example_en":"We did an experiment in class.","example_cn":"我们在课堂上做了一个实验。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🔬","⭐","💡","⚡"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["⚡","⭐","🔬","💡"],"answer":2},{"type":"meaning_choice","prompt":"experiment 是什么意思？（1/2）","options":["发明","能量","实验","回收利用"],"answer":2},{"type":"meaning_choice","prompt":"experiment 是什么意思？（2/2）","options":["实验","回收利用","发明","能量"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: expe__ment","answer":"ri"}],"letters":["e","x","p","e","r","i","m","e","n","t"],"syllables":["ex","pe","ri","ment"],"hint_cn":"动手试一试，看看会发生什么"},{"word":"recycle","phonetic":"/ˌriːˈsaɪkl/","meaning":"回收利用","emoji":"♻️","example_en":"Please recycle the plastic bottles.","example_cn":"请回收塑料瓶。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["♻️","⭐","🏭","🎲"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🎲","⭐","♻️","🏭"],"answer":2},{"type":"meaning_choice","prompt":"recycle 是什么意思？（1/2）","options":["污染","实验","回收利用","发明"],"answer":2},{"type":"meaning_choice","prompt":"recycle 是什么意思？（2/2）","options":["回收利用","发明","污染","实验"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: rec__cle","answer":"y"}],"letters":["r","e","c","y","c","l","e"],"syllables":["re","cy","cle"],"hint_cn":"用过的瓶子纸箱送回去，重新做成新东西"},{"word":"pollution","phonetic":"/pəˈluːʃn/","meaning":"污染","emoji":"🏭","example_en":"Air pollution is bad for our health.","example_cn":"空气污染有害健康。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🏭","⭐","🔬","☂️"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["☂️","⭐","🏭","🔬"],"answer":2},{"type":"meaning_choice","prompt":"pollution 是什么意思？（1/2）","options":["回收利用","实验","污染","能量"],"answer":2},{"type":"meaning_choice","prompt":"pollution 是什么意思？（2/2）","options":["污染","能量","回收利用","实验"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: pol__tion","answer":"lu"}],"letters":["p","o","l","l","u","t","i","o","n"],"syllables":["po","llu","tion"],"hint_cn":"水变黑了、天变灰了，就是因为这个"},{"word":"energy","phonetic":"/ˈenədʒi/","meaning":"能量；能源","emoji":"⚡","example_en":"The sun gives us energy.","example_cn":"太阳给我们能量。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["⚡","⭐","💡","🎸"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🎸","⭐","⚡","💡"],"answer":2},{"type":"meaning_choice","prompt":"energy 是什么意思？（1/2）","options":["发明","污染","能量；能源","实验"],"answer":2},{"type":"meaning_choice","prompt":"energy 是什么意思？（2/2）","options":["能量；能源","实验","发明","污染"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: en__gy","answer":"er"}],"letters":["e","n","e","r","g","y"],"syllables":["en","er","gy"],"hint_cn":"让灯亮起来、让车跑起来的“力气”"}]},{"id":"w5-mon-reading","name_cn":"阅读理解","type":"reading","duration":10,"passage":"The Palace Museum, or the Forbidden City, stands in the heart of Beijing. Emperors of the Ming and Qing dynasties lived there for almost 500 years. The palace has about 9000 rooms. Its buildings are made of wood, without a single nail. Red walls and golden roofs shine under the blue sky. Over seventeen million people visit this great museum every year.","passage_cn":"故宫博物院，又叫紫禁城，坐落在北京市中心。明清两代的皇帝在这里生活了近五百年。故宫有大约九千间房。建筑全部用木头建成，不用一根钉子。红墙金瓦在蓝天下闪闪发光。每年有一千七百多万人来参观这座伟大的博物馆。","questions":[{"id":"w5-mon-rd1","type":"choice","question":"What do people also call the Forbidden City?","options":["The Palace Museum","The Summer Palace","The Great Wall","Tian'anmen Square"],"answer":0,"explanation_cn":"第一句：also known as the Palace Museum（又叫故宫博物院）。"},{"id":"w5-mon-rd3","type":"choice","question":"How many years did emperors live there?","options":["For almost 500 years","For almost 5000 years","For almost 50 years","For almost 15 years"],"answer":0,"explanation_cn":"近五百年（almost 500 years）。"},{"id":"w5-mon-rd5","type":"choice","question":"What are the palace buildings made of?","options":["Wood without a single nail","Stone and iron","Glass and steel","Paper and bamboo"],"answer":0,"explanation_cn":"全木结构，不用一根钉子。"},{"id":"w5-mon-rd10","type":"choice","question":"The best title for this passage about the old palace is ___.","options":["The Palace Museum, Old and New","Snow in Beijing","How to Build a Palace","Emperors' Food"],"answer":0,"explanation_cn":"全文介绍故宫的历史与今天的新面貌。"}]},{"id":"w5-mon-mc","name_cn":"单项选择","type":"multiple_choice","duration":5,"questions":[{"id":"w5-mon-mc1","type":"choice","question":"The Palace Museum ___ in the heart of Beijing.","options":["stands","stand","standing","stood"],"answer":0,"explanation_cn":"主语单数，一般现在时用 stands。"},{"id":"w5-mon-mc2","type":"choice","question":"Emperors ___ there for almost 500 years.","options":["lived","live","lives","living"],"answer":0,"explanation_cn":"for almost 500 years 过去时间段，用过去式 lived。"},{"id":"w5-mon-mc3","type":"choice","question":"The buildings are made ___ wood without a single nail.","options":["of","from","in","with"],"answer":0,"explanation_cn":"be made of 用原材料（看得出原料）用 of。"},{"id":"w5-mon-mc4","type":"choice","question":"___ beautiful the red walls are!","options":["How","What","Where","When"],"answer":0,"explanation_cn":"How + 形容词：How beautiful…!"}]}]},{"day_cn":"周二","day_en":"Tuesday","is_speaking_day":false,"total_duration":30,"theme_cn":"阅读理解 + 语法练习 + 单项选择","modules":[{"id":"w5-tue-reading","name_cn":"阅读理解","type":"reading","duration":10,"passage":"Chang'e is the name of China's moon exploration programme. It comes from a goddess in an old Chinese story. In 2020, Chang'e-5 flew to the moon and brought soil back to the earth. In 2024, Chang'e-6 brought back soil from the far side of the moon. The soil helps scientists learn how the moon was born. Maybe Chinese astronauts will walk on the moon one day.","passage_cn":"「嫦娥」是中国探月工程的名字。它来自古代神话里的仙女。2020年，嫦娥五号飞向月球，把土壤带回了地球。2024年，嫦娥六号带回了月球背面的土壤。月壤帮助科学家研究月球是怎样诞生的。也许有一天，中国航天员会踏上月球。","questions":[{"id":"w5-tue-rd1","type":"choice","question":"What is the name Chang'e taken from?","options":["A goddess in an old Chinese story","A famous scientist","A mountain in China","An old song"],"answer":0,"explanation_cn":"名字取自古代神话中的仙女。"},{"id":"w5-tue-rd2","type":"choice","question":"What did Chang'e-5 bring home in 2020?","options":["It brought moon soil back to the earth.","It planted trees on the moon.","It found water on Mars.","It took tourists to space."],"answer":0,"explanation_cn":"嫦娥五号采集月壤并带回地球。"},{"id":"w5-tue-rd4","type":"choice","question":"What was amazing about Chang'e-6?","options":["It brought back soil from the far side of the moon.","It carried astronauts.","It stayed on the moon for years.","It flew to Mars."],"answer":0,"explanation_cn":"嫦娥六号带回了月球背面的土壤。"},{"id":"w5-tue-rd10","type":"choice","question":"The best title for this passage about going to the moon is ___.","options":["Chang'e: China's Moon Journey","Stories of Goddesses","Life on the Moon","Rocks and Stones"],"answer":0,"explanation_cn":"全文围绕中国探月工程展开。"}]},{"id":"w5-tue-grammar","name_cn":"语法练习","type":"grammar","duration":10,"questions":[{"id":"w5-tue-gr1","type":"choice","question":"The programme ___ in 2004, and it has grown fast.","options":["started","starts","starting","start"],"answer":0,"explanation_cn":"in 2004 过去时间，用过去式 started。"},{"id":"w5-tue-gr2","type":"choice","question":"Moon soil is different ___ the soil on the earth.","options":["from","with","at","of"],"answer":0,"explanation_cn":"be different from…：与…不同。"},{"id":"w5-tue-gr3","type":"choice","question":"The robot car can work ___ nobody is there.","options":["when","because","so","but"],"answer":0,"explanation_cn":"「在没有人时」也能工作，when。"},{"id":"w5-tue-gr4","type":"choice","question":"It took the scientists years ___ the mission.","options":["to prepare","prepare","preparing","prepared"],"answer":0,"explanation_cn":"It takes sb time to do sth：花多年准备。"},{"id":"w5-tue-gr5","type":"choice","question":"The moon is about 380000 kilometres ___ from the earth.","options":["away","far","long","away from"],"answer":0,"explanation_cn":"数字 + away：三十八万公里之远。"},{"id":"w5-tue-gr6","type":"choice","question":"Neither the soil ___ the photos can tell us everything.","options":["nor","or","either","and"],"answer":0,"explanation_cn":"neither…nor…：土壤和照片都不能告诉我们全部。"}]},{"id":"w5-tue-choice","name_cn":"单项选择","type":"multiple_choice","duration":10,"questions":[{"id":"w5-tue-mc1","type":"choice","question":"The programme ___ its name from an old story.","options":["took","takes","take","taking"],"answer":0,"explanation_cn":"讲述已完成的事实用过去式 took。"},{"id":"w5-tue-mc2","type":"choice","question":"Chang'e-5 ___ the moon in 2020.","options":["reached","reaches","reaching","reach"],"answer":0,"explanation_cn":"in 2020 过去时间，用过去式 reached。"},{"id":"w5-tue-mc3","type":"choice","question":"It was the first time that any country ___ moon rocks home in forty years.","options":["had brought","brought","has brought","brings"],"answer":0,"explanation_cn":"It was the first time that + 过去完成时：had brought。"},{"id":"w5-tue-mc4","type":"choice","question":"The far side is the side we ___ never see from the earth.","options":["can","cans","may be","are"],"answer":0,"explanation_cn":"can 后面用动词原形 see。"},{"id":"w5-tue-mc5","type":"choice","question":"Scientists study the soil ___ how the moon was born.","options":["to learn","learn","learning","learned"],"answer":0,"explanation_cn":"目的状语用 to learn。"},{"id":"w5-tue-mc6","type":"choice","question":"A small robot car ___ on the moon and took photos.","options":["drove","drives","driving","driven"],"answer":0,"explanation_cn":"and 并列过去动作，drove（drive 的过去式）。"},{"id":"w5-tue-mc7","type":"choice","question":"Chinese astronauts ___ walk on the moon one day.","options":["may","mays","may be","maybe"],"answer":0,"explanation_cn":"may + 动词原形：may walk。maybe 是副词，不能加动词。"},{"id":"w5-tue-mc8","type":"choice","question":"The moon travels ___ the earth.","options":["around","round of","around of","to around"],"answer":0,"explanation_cn":"月球绕着地球转：travels around the earth。"}]}]},{"day_cn":"周三","day_en":"Wednesday","is_speaking_day":true,"total_duration":50,"theme_cn":"AI口语 + 高频词汇 + 阅读理解","modules":[{"id":"w5-wed-speaking","name_cn":"AI口语练习","type":"speaking","duration":30,"questions":[{"id":"w5-wed-sp1","sentence":"What would you like to do after you finish school?","sentence_cn":"毕业后你想做什么？","options":["I would like to study medicine at university.","I would like to finished my homework.","I finished school last year.","School is interesting."],"answer":0,"pronunciation_tips":"would like to 中 would 弱读 /wəd/，medicine /ˈmedsn/ 英式可读两音节","explanation_cn":"would like to + 动词原形 意为想要做。A 正确；B would like to 后面接了过去式，错误；C、D 答非所问。","explanation_en":"'Would like to + base verb' means to want to do. A is correct; B wrongly uses the past form after 'to'; C and D do not answer.","answer_cn_hint":"它在问「毕业后想做什么」（将来的打算），答句要用 would like to / want to 加动词。","options_cn":["我想在大学学医。","我想完成了我的作业。","我去年毕业了。","学校很有趣。"]},{"id":"w5-wed-sp2","sentence":"Tell me about a person you admire.","sentence_cn":"说说你敬佩的一个人。","options":["I admire my PE teacher because he never gives up.","I admire him to run fast.","My PE teacher teaches maths too.","I gave him my book."],"answer":0,"pronunciation_tips":"admire /ədˈmaɪə/ 重音在第二音节，gives up 连读","explanation_cn":"A 说出人并给出敬佩的原因（从不放弃），完整。B admire 后面搭配错误；C 只是事实；D 答非所问。","explanation_en":"A names the person and gives the reason ('never gives up'); B uses a wrong pattern after 'admire'; C is just a fact; D does not answer.","answer_cn_hint":"这是请你介绍一个人，答句要说他是谁，再说你敬佩他什么。","options_cn":["我敬佩我的体育老师，因为他从不放弃。","我敬佩他跑得快。","我的体育老师也教数学。","我把书给了他。"]},{"id":"w5-wed-sp3","sentence":"What do you usually do to keep healthy?","sentence_cn":"你平时怎么保持健康？","options":["I run every morning and go to bed early.","I am very healthy.","Health is very important.","My mother cooks healthy food."],"answer":0,"pronunciation_tips":"healthy /ˈhelθi/ 注意 th 咬舌，go to bed early 连读","explanation_cn":"how 问做法，A 说出两件具体的事，正确。B 只说状态；C 是观点；D 说的是妈妈。","explanation_en":"'What do you do' asks for actions. A gives two concrete habits; B states a fact about yourself; C is an opinion; D is about mother.","answer_cn_hint":"它在问「怎么保持健康」，答句要说出具体做法，比如跑步、早睡。","options_cn":["我每天早上跑步，而且睡得早。","我很健康。","健康非常重要。","我妈妈做的饭很健康。"]},{"id":"w5-wed-sp4","sentence":"If you could have one superpower, what would it be?","sentence_cn":"如果你能拥有一种超能力，会是什么？","options":["I would like to fly, so I could see the whole world.","I will have a superpower next year.","Superpowers are not real things.","I can run very fast."],"answer":0,"pronunciation_tips":"superpower /ˈsuːpəpaʊə/ 复合词重音在前，could /kʊd/ 不要读成 /kʌd/","explanation_cn":"could 开头的虚拟问句，回答用 would。A 正确且补充了理由；B 用了 will，时态不对；C、D 答非所问。","explanation_en":"An imagined situation with 'could' is answered with 'would'. A is correct and adds a reason; B wrongly uses 'will'; C and D do not answer.","answer_cn_hint":"这是假设句，答句要用 I would like to … 说出你想要的超能力，最好再说为什么。","options_cn":["我想飞，这样就能看到整个世界。","我明年会有超能力。","超能力不是真实的东西。","我能跑得很快。"]},{"id":"w5-wed-sp5","sentence":"What was the best trip you have ever taken?","sentence_cn":"你去过最好的一次旅行是什么？","options":["The best trip was to Xi'an with my class.","I will take a trip this summer.","Trips are always tiring.","I take the bus to school."],"answer":0,"pronunciation_tips":"have ever taken 注意 taken /ˈteɪkən/ 是 take 的过去分词，Xi'an 读作 /ʃiːˈæn/","explanation_cn":"have ever taken 是完成时，A 回答了最好的一次经历，正确。B 是将来；C 是评价；D 是日常通勤不是旅行。","explanation_en":"A answers with the best trip experience; B is future; C is an opinion; D describes a daily commute, not a trip.","answer_cn_hint":"它在问「最好的一次旅行」，答句要说出去了哪里。","options_cn":["最好的一次旅行是和同学去西安。","今年夏天我要去旅行。","旅行总是很累。","我坐公交车上学。"]}]},{"id":"w5-wed-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"soldier","phonetic":"/ˈsəʊldʒə/","meaning":"士兵","emoji":"🪖","example_en":"The soldiers stood on the wall.","example_cn":"士兵们站在城墙上。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🪖","⭐","🏯","🧵"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🧵","⭐","🪖","🏯"],"answer":2},{"type":"meaning_choice","prompt":"soldier 是什么意思？（1/2）","options":["宫殿","丝绸","士兵","贸易"],"answer":2},{"type":"meaning_choice","prompt":"soldier 是什么意思？（2/2）","options":["士兵","贸易","宫殿","丝绸"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: sol__er","answer":"di"}],"letters":["s","o","l","d","i","e","r"],"syllables":["sol","dier"],"hint_cn":"穿军装、保卫国家的人"},{"word":"palace","phonetic":"/ˈpæləs/","meaning":"宫殿","emoji":"🏯","example_en":"The palace has a long history.","example_cn":"这座宫殿历史悠久。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🏯","⭐","🪖","🚢"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🚢","⭐","🏯","🪖"],"answer":2},{"type":"meaning_choice","prompt":"palace 是什么意思？（1/2）","options":["士兵","奇迹","宫殿","贸易"],"answer":2},{"type":"meaning_choice","prompt":"palace 是什么意思？（2/2）","options":["宫殿","贸易","士兵","奇迹"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: pal__e","answer":"ac"}],"letters":["p","a","l","a","c","e"],"syllables":["pal","ace"],"hint_cn":"古代国王住的那种大房子"},{"word":"silk","phonetic":"/sɪlk/","meaning":"丝绸","emoji":"🧵","example_en":"This scarf is made of silk.","example_cn":"这条围巾是丝绸做的。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🧵","⭐","🚗","🗻"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🗻","⭐","🧵","🚗"],"answer":2},{"type":"meaning_choice","prompt":"silk 是什么意思？（1/2）","options":["宫殿","贸易","丝绸","士兵"],"answer":2},{"type":"meaning_choice","prompt":"silk 是什么意思？（2/2）","options":["丝绸","士兵","宫殿","贸易"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: s__lk","answer":"i"}],"letters":["s","i","l","k"],"syllables":["silk"],"hint_cn":"摸起来滑滑的、亮亮的布"},{"word":"trade","phonetic":"/treɪd/","meaning":"贸易；买卖","emoji":"🚢","example_en":"Ships carried goods for trade.","example_cn":"轮船运送货物做贸易。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🚢","⭐","🧵","☂️"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["☂️","⭐","🚢","🧵"],"answer":2},{"type":"meaning_choice","prompt":"trade 是什么意思？（1/2）","options":["丝绸","宫殿","贸易；买卖","奇迹"],"answer":2},{"type":"meaning_choice","prompt":"trade 是什么意思？（2/2）","options":["贸易；买卖","奇迹","丝绸","宫殿"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: tr__e","answer":"ad"}],"letters":["t","r","a","d","e"],"syllables":["trade"],"hint_cn":"你有我需要的，我有你需要的，换一换"},{"word":"wonder","phonetic":"/ˈwʌndə/","meaning":"奇迹；奇观","emoji":"🗿","example_en":"The Great Wall is a wonder of the world.","example_cn":"长城是世界奇迹之一。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🗿","⭐","🚢","🎲"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🎲","⭐","🗿","🚢"],"answer":2},{"type":"meaning_choice","prompt":"wonder 是什么意思？（1/2）","options":["贸易","丝绸","奇迹；奇观","宫殿"],"answer":2},{"type":"meaning_choice","prompt":"wonder 是什么意思？（2/2）","options":["奇迹；奇观","宫殿","贸易","丝绸"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: wo__er","answer":"nd"}],"letters":["w","o","n","d","e","r"],"syllables":["won","der"],"hint_cn":"看到会“哇”一声的东西，比如长城"}]},{"id":"w5-wed-reading","name_cn":"阅读理解","type":"reading","duration":10,"passage":"C919 is China's first big passenger plane. The letter C stands for China. It can carry about 160 passengers. It can fly over five thousand kilometres without stopping. Its first passenger flight was in May 2023, from Shanghai to Beijing. China's own big plane is flying higher and higher.","passage_cn":"C919是中国自主制造的第一架大型客机。字母C代表中国。它可以载约160名乘客。它不休息能飞五千多公里。它的首次商业飞行在2023年5月，从上海到北京。中国自己的大飞机正飞得越来越高。","questions":[{"id":"w5-wed-rd1","type":"choice","question":"What does the letter C in C919 mean?","options":["China","Chang'e","Clean","Cloud"],"answer":0,"explanation_cn":"字母 C 代表中国（China）。"},{"id":"w5-wed-rd3","type":"choice","question":"How many passengers can the plane carry?","options":["About 160","About 1600","About 16","About 60"],"answer":0,"explanation_cn":"可载约160名乘客。"},{"id":"w5-wed-rd5","type":"choice","question":"When did C919 make its first passenger flight?","options":["In May 2023","In May 2020","In March 2013","In May 2033"],"answer":0,"explanation_cn":"首次商业飞行在2023年5月。"},{"id":"w5-wed-rd10","type":"choice","question":"The best title for this passage about the big plane is ___.","options":["C919, China's Own Big Plane","How to Fly a Plane","A Trip to Shanghai","Planes in the Past"],"answer":0,"explanation_cn":"全文介绍国产大飞机C919。"}]},{"id":"w5-wed-mc","name_cn":"单项选择","type":"multiple_choice","duration":5,"questions":[{"id":"w5-wed-mc1","type":"choice","question":"C919 is China's first big passenger plane ___ by itself.","options":["made","make","makes","making"],"answer":0,"explanation_cn":"过去分词 made 作后置定语：中国自主制造的。"},{"id":"w5-wed-mc2","type":"choice","question":"The plane can carry about ___ passengers.","options":["160","1600","16","60"],"answer":0,"explanation_cn":"约160名乘客。"},{"id":"w5-wed-mc3","type":"choice","question":"It can fly over five ___ kilometres without stopping.","options":["thousand","thousands","thousand of","thousands of"],"answer":0,"explanation_cn":"数词 + thousand 单数：five thousand。"},{"id":"w5-wed-mc4","type":"choice","question":"Its first passenger flight ___ in May 2023.","options":["was","is","were","be"],"answer":0,"explanation_cn":"in May 2023 过去时间，用 was。"}]}]},{"day_cn":"周四","day_en":"Thursday","is_speaking_day":false,"total_duration":43,"theme_cn":"名词复数 + 冠词 a/an + How much/many","modules":[{"id":"w5-thu-articles","name_cn":"单项选择：a / an","type":"multiple_choice","duration":8,"questions":[{"id":"w5-thu-an1","type":"choice","question":"选出正确的一组：1. bike  2. egg  3. university","options":["a / an / a","an / a / a","a / a / an","an / an / a"],"answer":0,"explanation_cn":"bike 辅音开头用 a；egg 元音 /e/ 开头用 an；university 虽以 u 开头，但读音是 /juː/（辅音），用 a university。"},{"id":"w5-thu-an2","type":"choice","question":"选出正确的一组：1. umbrella  2. big apple  3. English teacher","options":["a / a / an","an / a / an","an / an / a","a / an / an"],"answer":1,"explanation_cn":"umbrella 元音 /ʌ/ 开头用 an；big 辅音 /b/ 用 a；English 元音 /ɪ/ 用 an。"},{"id":"w5-thu-an3","type":"choice","question":"选出正确的一组：1. old book  2. European country  3. ID card","options":["a / an / a","an / an / a","an / a / an","a / a / an"],"answer":2,"explanation_cn":"old 元音 /əʊ/ 用 an；European 读音是 /jʊə/（辅音 j 开头）用 a；ID 读 /aɪ/ 元音用 an。"},{"id":"w5-thu-an4","type":"choice","question":"选出正确的一组：1. island  2. elephant  3. insect","options":["an / an / an","a / an / an","an / a / an","a / a / an"],"answer":0,"explanation_cn":"island、elephant、insect 都是元音音素开头，全部用 an。"},{"id":"w5-thu-an5","type":"choice","question":"选出正确的一组：1. ugly dog  2. unusual experience  3. honest boy","options":["a / an / an","an / an / an","a / a / an","an / a / a"],"answer":1,"explanation_cn":"ugly、unusual 元音开头用 an；honest 的 h 不发音，读音以元音 /ɒ/ 开头，所以是 an honest boy。"}]},{"id":"w5-thu-muchmany","name_cn":"打字题：How much / How many","type":"tense","duration":10,"questions":[{"id":"w5-thu-mm1","type":"fill","question":"How ___ sweets would you like? — A lot! [填 much 或 many]","answer":"many","explanation_cn":"sweets（糖果）是可数名词复数，用 how many。a lot 说明数量很多。"},{"id":"w5-thu-mm2","type":"fill","question":"How ___ bananas do you eat in a week? — Only a few. [填 much 或 many]","answer":"many","explanation_cn":"bananas 可数，用 how many；a few 修饰可数名词：only a few bananas。"},{"id":"w5-thu-mm3","type":"fill","question":"How ___ pasta would you like? — Just a little, please. [填 much 或 many]","answer":"much","explanation_cn":"pasta（意大利面）不可数，用 how much；a little 修饰不可数名词。"},{"id":"w5-thu-mm4","type":"fill","question":"How ___ ice cream would you like? — A lot, please! [填 much 或 many]","answer":"much","explanation_cn":"ice cream 此处指冰淇淋这种食物，不可数，用 how much。"},{"id":"w5-thu-mm5","type":"fill","question":"How ___ bread have we got? — Only a little. [填 much 或 many]","answer":"much","explanation_cn":"bread（面包）不可数，用 how much；Only a little 提醒我们要再买一些。"},{"id":"w5-thu-mm6","type":"fill","question":"How ___ oranges are you going to buy? — None. [填 much 或 many]","answer":"many","explanation_cn":"oranges 可数复数，用 how many。None 表示一个都不买——没带钱！"}]},{"id":"w5-thu-plural-fill","name_cn":"打字题：写出名词复数","type":"tense","duration":18,"questions":[{"id":"w5-thu-pf1","type":"fill","question":"写出复数：foot [用键盘打出来，全部小写]","answer":"feet","explanation_cn":"不规则变化：foot → feet（脚）。同类：tooth → teeth。"},{"id":"w5-thu-pf2","type":"fill","question":"写出复数：tooth [用键盘打出来，全部小写]","answer":"teeth","explanation_cn":"不规则变化：tooth → teeth（牙齿）。oo 变 ee。"},{"id":"w5-thu-pf3","type":"fill","question":"写出复数：child [用键盘打出来，全部小写]","answer":"children","explanation_cn":"不规则变化：child → children（孩子）。"},{"id":"w5-thu-pf4","type":"fill","question":"写出复数：mouse [用键盘打出来，全部小写]","answer":"mice","explanation_cn":"不规则变化：mouse → mice（老鼠）。"},{"id":"w5-thu-pf5","type":"fill","question":"写出复数：woman [用键盘打出来，全部小写]","answer":"women","explanation_cn":"不规则变化：woman → women（女人），a 变 e。"},{"id":"w5-thu-pf6","type":"fill","question":"写出复数：knife [用键盘打出来，全部小写]","answer":"knives","explanation_cn":"f/fe 结尾变 v 加 es：knife → knives。同类：leaf, shelf。"},{"id":"w5-thu-pf7","type":"fill","question":"写出复数：leaf [用键盘打出来，全部小写]","answer":"leaves","explanation_cn":"f 结尾变 v 加 es：leaf → leaves（树叶）。"},{"id":"w5-thu-pf8","type":"fill","question":"写出复数：shelf [用键盘打出来，全部小写]","answer":"shelves","explanation_cn":"f 结尾变 v 加 es：shelf → shelves（架子）。"},{"id":"w5-thu-pf9","type":"fill","question":"写出复数：country [用键盘打出来，全部小写]","answer":"countries","explanation_cn":"辅音字母 + y 结尾，变 y 为 i 加 es：country → countries。"},{"id":"w5-thu-pf10","type":"fill","question":"写出复数：family [用键盘打出来，全部小写]","answer":"families","explanation_cn":"辅音字母 + y 结尾，变 y 为 i 加 es：family → families。"},{"id":"w5-thu-pf11","type":"fill","question":"写出复数：dish [用键盘打出来，全部小写]","answer":"dishes","explanation_cn":"s, x, ch, sh 结尾加 es：dish → dishes。"},{"id":"w5-thu-pf12","type":"fill","question":"写出复数：box [用键盘打出来，全部小写]","answer":"boxes","explanation_cn":"s, x, ch, sh 结尾加 es：box → boxes。"},{"id":"w5-thu-pf13","type":"fill","question":"写出复数：watch [用键盘打出来，全部小写]","answer":"watches","explanation_cn":"ch 结尾加 es：watch → watches。"},{"id":"w5-thu-pf14","type":"fill","question":"写出复数：sandwich [用键盘打出来，全部小写]","answer":"sandwiches","explanation_cn":"ch 结尾加 es：sandwich → sandwiches（三明治）。"}]},{"id":"w5-thu-plural-choice","name_cn":"单项选择：名词复数","type":"multiple_choice","duration":7,"questions":[{"id":"w5-thu-pm1","type":"choice","question":"选出正确的一组复数：tomato 和 photo","options":["tomatoes / photos","tomatos / photoes","tomatoes / photoes","tomatos / photos"],"answer":0,"explanation_cn":"-o 结尾有的加 es（tomatoes, heroes），photo 是 photograph 的缩略词只加 s：photos。"},{"id":"w5-thu-pm2","type":"choice","question":"选出正确的一组复数：boy 和 toy","options":["boies / toys","boys / toies","boys / toys","boies / toies"],"answer":2,"explanation_cn":"元音字母 + y 结尾直接加 s：boy → boys，toy → toys（对照 country 变 ies）。"},{"id":"w5-thu-pm3","type":"choice","question":"选出正确的一组复数：sheep 和 fish","options":["sheeps / fishs","sheep / fish","sheep / fishs","sheeps / fish"],"answer":1,"explanation_cn":"sheep 和 fish 单复数同形：one sheep, two sheep；one fish, two fish。"},{"id":"w5-thu-pm4","type":"choice","question":"选出正确的一组复数：class 和 Japanese","options":["classes / Japanese","class / Japaneses","classes / Japaneses","classs / Japanese"],"answer":0,"explanation_cn":"class 以 s 结尾加 es：classes；Japanese（日本人）单复数同形，不加 s。"},{"id":"w5-thu-pm5","type":"choice","question":"选出正确的一组复数：hero 和 fly","options":["heros / flys","heroes / flys","heros / flies","heroes / flies"],"answer":3,"explanation_cn":"hero 加 es：heroes（hero, tomato 这类加 es）；fly 辅音 + y 变 ies：flies。"}]}]},{"day_cn":"周五","day_en":"Friday","is_speaking_day":false,"total_duration":45,"theme_cn":"模板写作 + KET/PET题型 + 语法复习","modules":[{"id":"w5-fri-writing","name_cn":"写作练习","type":"writing_template","duration":15,"title":"My Healthy Life","requirement_cn":"请根据关键词提示完成作文，完成后请背诵全文。明天将进行挖空默写测试！","keywords":["do morning exercises","eat more vegetables","drink milk","go to bed early","strong and healthy"],"keywords_cn":["做早操","多吃蔬菜","喝牛奶","早点睡觉","强壮又健康"],"template":"Every morning, I {{1}} in the park. At meals, I {{2}} and seldom eat junk food. Before school, I {{3}} with bread. I never stay up late, and I {{4}} every night. Good habits make me {{5}}.","blanks":[{"id":1,"hint_cn":"做早操","hint_en":"do morning exercises","answer":"do morning exercises"},{"id":2,"hint_cn":"多吃蔬菜","hint_en":"eat more vegetables","answer":"eat more vegetables"},{"id":3,"hint_cn":"喝牛奶","hint_en":"drink milk","answer":"drink milk"},{"id":4,"hint_cn":"早点睡觉","hint_en":"go to bed early","answer":"go to bed early"},{"id":5,"hint_cn":"强壮又健康","hint_en":"strong and healthy","answer":"strong and healthy"}],"full_text":"Every morning, I do morning exercises in the park. At meals, I eat more vegetables and seldom eat junk food. Before school, I drink milk with bread. I never stay up late, and I go to bed early every night. Good habits make me strong and healthy.","full_text_cn":"每天早上，我在公园里做早操。吃饭时，我多吃蔬菜，很少吃垃圾食品。上学前，我喝牛奶，配着面包。我从不熬夜，每天晚上都早点睡觉。好习惯让我强壮又健康。","explanation_cn":"这篇作文围绕健康生活展开，用了5个关键词：1) do morning exercises 做早操；2) eat more vegetables 多吃蔬菜；3) drink milk 喝牛奶；4) go to bed early 早点睡觉；5) strong and healthy 强壮又健康。全文用一般现在时，主语是 I，动词用原形。good habits make me + 形容词，意思是「好习惯让我……」。","explanation_en":"This essay is about healthy living, using 5 keywords. Simple present tense with I. The pattern \"good habits make me + adjective\" means good habits bring you something."},{"id":"w5-fri-ket","name_cn":"KET/PET题型","type":"ket_pet","duration":10,"questions":[{"id":"w5-fri-kp1","type":"choice","question":"PET: Choose the correct answer. This is the museum ___ we visited last year.","options":["where","which","when","whose"],"answer":1,"explanation_cn":"定语从句。visit 是及物动词，缺宾语，先行词是物（museum），用 which/that。where 只能作状语（visited there 就不缺宾语了）。","explanation_en":"Relative clause: 'visited' is missing an object, and the antecedent is a thing, so 'which/that' is used. 'Where' would leave 'visited' without an object."},{"id":"w5-fri-kp2","type":"choice","question":"PET: Choose the correct answer. I ___ getting up early because I run every morning.","options":["am used to","used to","was used to","use to"],"answer":0,"explanation_cn":"be used to doing 意为习惯于做某事，to 是介词后面接动名词。used to do 意为过去常常做（现在不做了），意思不同。","explanation_en":"'Be used to doing' means to be accustomed to doing. 'Used to do' means did it in the past but not now — a different meaning."},{"id":"w5-fri-kp3","type":"fill","question":"PET: Complete the sentence. 'The box is so heavy that I can't carry it.' = The box is too heavy ___ me to carry.","answer":"for","explanation_cn":"so...that... 转换为 too...for sb to do。too heavy for me to carry 意为太重了我搬不动。注意 for 引出人。","explanation_en":"'So...that...' becomes 'too...for somebody to do'. Note: 'for' introduces the person."},{"id":"w5-fri-kp4","type":"choice","question":"PET: Choose the correct answer. I don't know ___ to deal with this problem.","options":["how","what","which","why"],"answer":0,"explanation_cn":"deal with（处理）的搭配是 how to deal with。what 常和 do with 搭配：what to do with。这两个搭配不要混。","explanation_en":"'Deal with' goes with 'how': how to deal with. 'Do with' goes with 'what'. Don't mix the two pairs."},{"id":"w5-fri-kp5","type":"choice","question":"PET: Choose the correct answer. By the end of last year, they ___ five thousand trees.","options":["planted","had planted","have planted","will plant"],"answer":1,"explanation_cn":"by the end of + 过去时间（last year），用过去完成时 had planted。表示到过去某个时间点为止已完成。","explanation_en":"'By the end of + past time' takes the past perfect: 'had planted'. It shows the action was complete before that past point."}]},{"id":"w5-fri-grammar","name_cn":"语法复习","type":"grammar","duration":20,"questions":[{"id":"w5-fri-gr18","type":"choice","question":"Look at the picture. Three ___ are on the floor.（玩具）","options":["toy","toies","toys","toyies"],"answer":2,"explanation_cn":"toy 直接加 s：toys。以「元音+y」结尾的词复数直接加 s，不变 ies。","explanation_en":"Toy ends in vowel + y, so the plural is just toys."},{"id":"w5-fri-gr19","type":"choice","question":"The painter needs two ___ .（刷子）","options":["brush","brushs","brushes","brushies"],"answer":2,"explanation_cn":"brush 以 sh 结尾，复数加 -es：brushes。s/x/ch/sh 结尾都加 -es。","explanation_en":"Brush ends in -sh, so the plural is brushes."},{"id":"w5-fri-gr20","type":"choice","question":"There are many ___ in the world.（国家）","options":["countrys","country","countryes","countries"],"answer":3,"explanation_cn":"country 是「辅音+y」结尾，变 y 为 i 加 es：countries。同类的还有 city→cities。","explanation_en":"Country: consonant + y becomes countries (y → i, add -es)."},{"id":"w5-fri-hm1","type":"fill","question":"Fill in how much or how many: ___ sweets would you like?（答句：A lot. I love them!）","answer":"how many","explanation_cn":"sweets 糖果是可数名词复数，问数量用 how many。how much 用来问不可数名词或价格。","explanation_en":"Sweets is countable, so we ask: How many sweets?"},{"id":"w5-fri-hm2","type":"fill","question":"Fill in how much or how many: ___ bananas do you eat in a week?（答句：Only a few. One or two, maybe.）","answer":"how many","explanation_cn":"bananas 香蕉可数，用 how many。答句 Only a few（只有几个）也在提示这是可数数量。","explanation_en":"Bananas are countable: How many bananas do you eat in a week?"},{"id":"w5-fri-hm3","type":"fill","question":"Fill in how much or how many: ___ pasta would you like?（答句：Just a little, please. I'm not very hungry.）","answer":"how much","explanation_cn":"pasta 意面是不可数名词，用 how much。答句 a little 也说明它不可数。","explanation_en":"Pasta is uncountable, so we ask: How much pasta?"},{"id":"w5-fri-hm4","type":"fill","question":"Fill in how much or how many: ___ ice cream would you like?（答句：A little, please. It's my favourite!）","answer":"how much","explanation_cn":"ice cream 指冰淇淋这种食物时不可数，用 how much。答句 a little 也是不可数的量。","explanation_en":"Ice cream (the food) is uncountable here: How much ice cream?"},{"id":"w5-fri-hm5","type":"fill","question":"Fill in how much or how many: ___ bread have we got?（答句：Only a little. We need to buy some.）","answer":"how much","explanation_cn":"bread 面包不可数，用 how much。要数一条一条的面包得说 a loaf of bread。","explanation_en":"Bread is uncountable: How much bread have we got?"},{"id":"w5-fri-hm6","type":"fill","question":"Fill in how much or how many: ___ oranges are you going to buy?（答句：A lot. / None. I haven't got any money.）","answer":"how many","explanation_cn":"oranges 橙子可数复数，用 how many。问价格才用 how much（How much are the oranges?）。","explanation_en":"Oranges are countable: How many oranges are you going to buy?"},{"id":"w5-fri-gm1","type":"choice","question":"___ sugar do you want?（糖）","options":["How much","How many","How often","How long"],"answer":0,"explanation_cn":"sugar 糖是不可数名词，问多少用 How much。How many 后面要跟可数名词复数。","explanation_en":"Sugar is uncountable, so we say: How much sugar do you want?"},{"id":"w5-fri-gm2","type":"choice","question":"Don't use ___ salt.（盐；别放太多盐）","options":["a lot of","a little of","many","much of"],"answer":0,"explanation_cn":"a lot of 后面直接跟名词，可数不可数都行：a lot of salt。不能说 a little of salt，要去掉 of：a little salt。","explanation_en":"We say 'a lot of salt'. 'A little of salt' is wrong — drop the of: 'a little salt'."},{"id":"w5-fri-gm3","type":"choice","question":"We've still got ___ carrots in the kitchen.（厨房里还有几根胡萝卜）","options":["a few","a little","much","a little of"],"answer":0,"explanation_cn":"carrots 可数复数，用 a few（几个）。a little 只能修饰不可数名词，much 常用于否定和疑问。","explanation_en":"Carrots are countable, so we say a few carrots."},{"id":"w5-fri-gm4","type":"choice","question":"___ fruit do you eat a day?（水果）","options":["How much","How many","How often","How old"],"answer":0,"explanation_cn":"fruit 水果通常作不可数名词，用 How much。只有说具体种类（fruits）时才可数。","explanation_en":"Fruit is usually uncountable: How much fruit do you eat a day?"},{"id":"w5-fri-gm5","type":"choice","question":"Is there ___ butter in the fridge?（冰箱里有黄油吗）","options":["any","a","some","many"],"answer":0,"explanation_cn":"疑问句和否定句里用 any：Is there any butter? some 一般用在肯定句，或表示请求邀请的问句里。","explanation_en":"In questions and negatives we use any: Is there any butter in the fridge?"},{"id":"w5-fri-gm6","type":"choice","question":"Would you like ___ bread?（要不要来点面包）","options":["some","a","any","many"],"answer":0,"explanation_cn":"Would you like…? 是客气的提供，这种问句里用 some，期待对方说好。普通疑问句才用 any。","explanation_en":"In polite offers like 'Would you like…?' we use some bread."}]}]},{"day_cn":"周六","day_en":"Saturday","is_speaking_day":true,"total_duration":50,"theme_cn":"AI口语 + 高频词汇 + 阅读理解","modules":[{"id":"w5-sat-speaking","name_cn":"AI口语练习","type":"speaking","duration":30,"questions":[{"id":"w5-sat-sp1","sentence":"What advice would you give to a friend who is nervous before a test?","sentence_cn":"朋友考试前紧张，你会给他什么建议？","options":["I would tell him to take a deep breath and believe in himself.","I will tell him that tests are easy.","I told him to study harder last week.","He is always nervous about tests."],"answer":0,"pronunciation_tips":"advice /ədˈvaɪs/ 名词重音在后，注意和动词 advise 的读音区别；breath /breθ/ 咬舌","explanation_cn":"would give 表示虚拟建议，A 用 would tell him to do 结构，正确。B 应该是 I would tell；C 是过去的事不是建议；D 只是描述。","explanation_en":"The imagined advice uses 'would': A is correct. B should also use 'would'; C reports the past, not advice; D just describes.","answer_cn_hint":"它在问「你会给什么建议」，答句要用 I would tell him to … 说出一个建议。","options_cn":["我会告诉他深呼吸，相信自己。","我会告诉他考试很简单。","我上周告诉他要更努力学习。","他考试总是很紧张。"]},{"id":"w5-sat-sp2","sentence":"Do you prefer reading books or watching films?","sentence_cn":"你喜欢看书还是看电影？","options":["I prefer books because I can imagine the pictures myself.","I prefer to watch TV at home.","I watched a film last night.","Books and films are both cheap."],"answer":0,"pronunciation_tips":"prefer /prɪˈfɜː/ 重音在第二音节，imagine /ɪˈmædʒɪn/","explanation_cn":"prefer A to B / prefer doing 表示更喜欢。问二选一，A 明确选了书并给出原因，正确。B 换成了电视没有二选一；C、D 答非所问。","explanation_en":"The question asks to choose between two things. A chooses books and gives a reason; B answers with a third thing; C and D do not answer.","answer_cn_hint":"这是二选一，答句要先说你选哪一个，再说理由（because…）。","options_cn":["我更喜欢看书，因为我可以自己想象画面。","我更喜欢在家看电视。","我昨晚看了一部电影。","书和电影都很便宜。"]},{"id":"w5-sat-sp3","sentence":"What is the most important thing you have learned at school?","sentence_cn":"你在学校学到的最重要的东西是什么？","options":["Learning how to learn is the most important thing.","I learned English for six years.","The school building is very old.","I have learned to be on time."],"answer":0,"pronunciation_tips":"important /ɪmˈpɔːtnt/ 注意重音，learned 此处作动词过去分词读 /lɜːnd/","explanation_cn":"A 用动名词短语作主语回答最重要的东西，正确且深刻。B 只是学了多久；C 答非所问；D 说的是学到的一件事但题目问最重要，D 也可算答但 A 直接呼应最高级 the most important，最佳。","explanation_en":"A answers with the superlative directly ('the most important thing'); B only gives a duration; C is off topic; D gives an example but A matches the question best.","answer_cn_hint":"它在问「最重要的一样东西」，答句要说出一样具体的收获。","options_cn":["学会怎么学习是最重要的。","我学了六年英语。","学校的楼很旧。","我学会了守时。"]},{"id":"w5-sat-sp4","sentence":"How can we help old people in our community?","sentence_cn":"我们能怎样帮助社区里的老人？","options":["We can visit them and help them carry things.","Old people like talking about the past.","Our community is very big.","They usually get up early."],"answer":0,"pronunciation_tips":"community /kəˈmjuːnəti/ 重音在第二音节，help them 中 them 常弱读 /ðəm/","explanation_cn":"how 问方法，A 说出两件具体能做的事，正确。B、C、D 都是描述性陈述，没有回答怎么帮。","explanation_en":"'How' asks for a way. A gives two concrete actions; B, C and D are statements that do not answer.","answer_cn_hint":"它在问「怎样帮助老人」，答句要用 We can … 说出具体做法。","options_cn":["我们可以去看望他们，帮他们拿东西。","老人喜欢谈过去的事。","我们的社区很大。","他们通常起得很早。"]},{"id":"w5-sat-sp5","sentence":"If you could travel to any country, where would you go?","sentence_cn":"如果你能去任何国家旅行，你会去哪里？","options":["I would go to Egypt to see the pyramids.","I will go to Egypt next month.","I went to Egypt with my parents.","Egypt is in Africa."],"answer":0,"pronunciation_tips":"Egypt /ˈiːdʒɪpt/ 注意开头是长元音 iː，pyramids /ˈpɪrəmɪdz/","explanation_cn":"could 虚拟提问，回答用 would，A 正确并说明原因。B 是真实计划用 will；C 是过去事实；D 是地理常识，答非所问。","explanation_en":"The imagined 'could' question is answered with 'would'. A is correct with a reason; B is a real plan; C is a past fact; D does not answer.","answer_cn_hint":"这是假设句，答句要用 I would go to … 说出一个地方。","options_cn":["我想去埃及看金字塔。","我下个月要去埃及。","我和父母去过埃及。","埃及在非洲。"]}]},{"id":"w5-sat-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"pyramid","phonetic":"/ˈpɪrəmɪd/","meaning":"金字塔","emoji":"🔺","example_en":"The pyramids are in Egypt.","example_cn":"金字塔在埃及。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🔺","⭐","🐪","❓"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["❓","⭐","🔺","🐪"],"answer":2},{"type":"meaning_choice","prompt":"pyramid 是什么意思？（1/2）","options":["骆驼","沙漠","金字塔","之谜"],"answer":2},{"type":"meaning_choice","prompt":"pyramid 是什么意思？（2/2）","options":["金字塔","之谜","骆驼","沙漠"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: py__mid","answer":"ra"}],"letters":["p","y","r","a","m","i","d"],"syllables":["pyr","a","mid"],"hint_cn":"埃及那种尖尖的、三角形的大石头建筑"},{"word":"desert","phonetic":"/ˈdezət/","meaning":"沙漠","emoji":"🐪","example_en":"Camels live in the desert.","example_cn":"骆驼生活在沙漠里。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🐪","⭐","🔺","🧭"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🧭","⭐","🐪","🔺"],"answer":2},{"type":"meaning_choice","prompt":"desert 是什么意思？（1/2）","options":["金字塔","之谜","沙漠","导游"],"answer":2},{"type":"meaning_choice","prompt":"desert 是什么意思？（2/2）","options":["沙漠","导游","金字塔","之谜"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: des__t","answer":"er"}],"letters":["d","e","s","e","r","t"],"syllables":["des","ert"],"hint_cn":"全是沙子、很少下雨的地方"},{"word":"camel","phonetic":"/ˈkæml/","meaning":"骆驼","emoji":"🐫","example_en":"The camel is called the ship of the desert.","example_cn":"骆驼被称为沙漠之舟。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🐫","⭐","🏜️","☂️"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["☂️","⭐","🐫","🏜️"],"answer":2},{"type":"meaning_choice","prompt":"camel 是什么意思？（1/2）","options":["沙漠","金字塔","骆驼","导游"],"answer":2},{"type":"meaning_choice","prompt":"camel 是什么意思？（2/2）","options":["骆驼","导游","沙漠","金字塔"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: cam__l","answer":"e"}],"letters":["c","a","m","e","l"],"syllables":["cam","el"],"hint_cn":"背上有鼓包，能在沙子里走很久"},{"word":"mystery","phonetic":"/ˈmɪstri/","meaning":"谜；神秘的事物","emoji":"❓","example_en":"The old house is full of mystery.","example_cn":"那座老房子充满神秘。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["❓","⭐","🚢","🎲"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🎲","⭐","❓","🚢"],"answer":2},{"type":"meaning_choice","prompt":"mystery 是什么意思？（1/2）","options":["导游","沙漠","谜；神秘的事物","骆驼"],"answer":2},{"type":"meaning_choice","prompt":"mystery 是什么意思？（2/2）","options":["谜；神秘的事物","骆驼","导游","沙漠"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: mys__ry","answer":"te"}],"letters":["m","y","s","t","e","r","y"],"syllables":["mys","te","ry"],"hint_cn":"想不明白、还等着人去解开的事"},{"word":"guide","phonetic":"/ɡaɪd/","meaning":"导游；指南","emoji":"🧭","example_en":"The guide showed us around the city.","example_cn":"导游带我们游览了这座城市。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🧭","⭐","❓","🎸"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🎸","⭐","🧭","❓"],"answer":2},{"type":"meaning_choice","prompt":"guide 是什么意思？（1/2）","options":["之谜","骆驼","导游；指南","沙漠"],"answer":2},{"type":"meaning_choice","prompt":"guide 是什么意思？（2/2）","options":["导游；指南","沙漠","之谜","骆驼"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: g__de","answer":"ui"}],"letters":["g","u","i","d","e"],"syllables":["guide"],"hint_cn":"带你逛、给你讲的那个人"}]},{"id":"w5-sat-reading","name_cn":"阅读理解","type":"reading","duration":10,"passage":"Paper cutting is one of China's oldest folk arts. With a pair of scissors and red paper, artists make wonderful pictures. During the Spring Festival, people in the north put paper cuttings on windows. The red colour means good luck. In 2009, paper cutting entered the world heritage list. Today this red art is popular around the world.","passage_cn":"剪纸是中国最古老的民间艺术之一。艺术家只用一把剪刀和红纸，就能剪出精彩的图画。春节时，中国北方的人们把剪纸贴在窗上。红色代表好运。2009年，剪纸被列入世界文化遗产名录。今天，这门红色的艺术在全世界流行。","questions":[{"id":"w5-sat-rd1","type":"choice","question":"What do artists use to make paper cuttings?","options":["Scissors and a piece of red paper","A knife and a board","A computer","Paints and brushes"],"answer":0,"explanation_cn":"一把剪刀和一张红纸即可。"},{"id":"w5-sat-rd2","type":"choice","question":"Where do people put paper cuttings at Spring Festival?","options":["On windows","On doors only","On cars","On beds"],"answer":0,"explanation_cn":"北方春节时把剪纸贴在窗上。"},{"id":"w5-sat-rd4","type":"choice","question":"In which year did paper cutting enter the world heritage list?","options":["In 2009","In 1999","In 2019","In 2020"],"answer":0,"explanation_cn":"2009年列入世界非遗名录。"},{"id":"w5-sat-rd10","type":"choice","question":"The best title for this passage about red paper art is ___.","options":["Paper Cutting Wins the World","How to Use Scissors","Red Windows in Winter","Artists in France"],"answer":0,"explanation_cn":"全文讲剪纸从中国走向世界。"}]},{"id":"w5-sat-mc","name_cn":"单项选择","type":"multiple_choice","duration":5,"questions":[{"id":"w5-sat-mc1","type":"choice","question":"Paper cutting is one of China's oldest ___ arts.","options":["folk","fool","full","fall"],"answer":0,"explanation_cn":"folk art 民间艺术，注意 folk 不是 fool（傻瓜）。"},{"id":"w5-sat-mc2","type":"choice","question":"Artists can make wonderful pictures ___ red paper.","options":["with","in","at","on"],"answer":0,"explanation_cn":"「用红纸」做，工具用 with。"},{"id":"w5-sat-mc3","type":"choice","question":"People put paper cuttings ___ windows during the festival.","options":["on","in","at","under"],"answer":0,"explanation_cn":"贴「在窗上」用 on windows。"},{"id":"w5-sat-mc4","type":"choice","question":"Red ___ good luck in Chinese culture.","options":["means","mean","meaning","meant"],"answer":0,"explanation_cn":"主语 red（红色）三单，用 means。"}]}]},{"day_cn":"周日","day_en":"Sunday","is_speaking_day":false,"total_duration":20,"theme_cn":"阅读理解 + 高频词汇 + 完形填空","modules":[{"id":"w5-sun-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"sight","phonetic":"/saɪt/","meaning":"视力","emoji":"👁️","example_en":"The illness took away her sight.","example_cn":"疾病夺走了她的视力。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["👁️","⭐","🤫","🤒"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🤒","⭐","👁️","🤫"],"answer":2},{"type":"meaning_choice","prompt":"sight 是什么意思？（1/2）","options":["安静的","疾病","视力","勇气"],"answer":2},{"type":"meaning_choice","prompt":"sight 是什么意思？（2/2）","options":["视力","勇气","安静的","疾病"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: s__ht","answer":"ig"}],"letters":["s","i","g","h","t"],"syllables":["sight"],"hint_cn":"用眼睛看东西的能力"},{"word":"silent","phonetic":"/ˈsaɪlənt/","meaning":"寂静的；沉默的","emoji":"🤫","example_en":"The room was silent.","example_cn":"房间里一片寂静。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🤫","⭐","🎓","🎲"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🎲","⭐","🤫","🎓"],"answer":2},{"type":"meaning_choice","prompt":"silent 是什么意思？（1/2）","options":["大学","视力","寂静的；沉默的","疾病"],"answer":2},{"type":"meaning_choice","prompt":"silent 是什么意思？（2/2）","options":["寂静的；沉默的","疾病","大学","视力"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: si__nt","answer":"le"}],"letters":["s","i","l","e","n","t"],"syllables":["si","lent"],"hint_cn":"一点点声音都没有"},{"word":"courage","phonetic":"/ˈkʌrɪdʒ/","meaning":"勇气","emoji":"🦁","example_en":"She had the courage to try again.","example_cn":"她有勇气再试一次。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🦁","⭐","👁️","☂️"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["☂️","⭐","🦁","👁️"],"answer":2},{"type":"meaning_choice","prompt":"courage 是什么意思？（1/2）","options":["视力","寂静的","勇气","大学"],"answer":2},{"type":"meaning_choice","prompt":"courage 是什么意思？（2/2）","options":["勇气","大学","视力","寂静的"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: cou__ge","answer":"ra"}],"letters":["c","o","u","r","a","g","e"],"syllables":["cour","age"],"hint_cn":"心里有点怕，但还是敢去做"},{"word":"university","phonetic":"/ˌjuːnɪˈvɜːsəti/","meaning":"大学","emoji":"🎓","example_en":"She went to university at eighteen.","example_cn":"她十八岁上了大学。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🎓","⭐","🤫","🚗"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🚗","⭐","🎓","🤫"],"answer":2},{"type":"meaning_choice","prompt":"university 是什么意思？（1/2）","options":["勇气","寂静的","大学","疾病"],"answer":2},{"type":"meaning_choice","prompt":"university 是什么意思？（2/2）","options":["大学","疾病","勇气","寂静的"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: univer__ty","answer":"si"}],"letters":["u","n","i","v","e","r","s","i","t","y"],"syllables":["u","ni","ver","si","ty"],"hint_cn":"读完中学以后去读书的地方"},{"word":"disease","phonetic":"/dɪˈziːz/","meaning":"疾病","emoji":"🤒","example_en":"Washing hands helps stop disease.","example_cn":"洗手有助于预防疾病。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🤒","⭐","🎓","🦁"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🦁","⭐","🤒","🎓"],"answer":2},{"type":"meaning_choice","prompt":"disease 是什么意思？（1/2）","options":["大学","视力","疾病","勇气"],"answer":2},{"type":"meaning_choice","prompt":"disease 是什么意思？（2/2）","options":["疾病","勇气","大学","视力"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: dis__se","answer":"ea"}],"letters":["d","i","s","e","a","s","e"],"syllables":["di","ease"],"hint_cn":"让人生病、身体不舒服的东西"}]},{"id":"w5-sun-cloze","name_cn":"完形填空","type":"cloze","duration":10,"passage":"Chinese characters are very old. People wrote on oracle bones 3000 years 1___. Early characters looked like the things they stood 2___. The character for mountain looked like three 3___. Today people write with pens and 4___. There are about 50000 characters, 5___ people only use a few thousand. These characters will keep 6___ for 5000 more years.","questions":[{"id":"w5-sun-cz1","type":"choice","question":"1___","options":["ago","before","later","after"],"answer":0,"explanation_cn":"「三千多年前」，时间 + ago。"},{"id":"w5-sun-cz2","type":"choice","question":"2___","options":["for","at","up","with"],"answer":0,"explanation_cn":"stand for：代表，固定短语。"},{"id":"w5-sun-cz3","type":"choice","question":"3___","options":["peaks","peak","peaks'","the peaks"],"answer":0,"explanation_cn":"「山」字像三个山峰，three peaks 复数。"},{"id":"w5-sun-cz4","type":"choice","question":"4___","options":["keyboards","keyboard's","keyboard","a keyboard"],"answer":0,"explanation_cn":"pens and keyboards：笔和键盘，并列复数。"},{"id":"w5-sun-cz5","type":"choice","question":"5___","options":["but","and","so","or"],"answer":0,"explanation_cn":"「有五万多字，但日常只用到几千个」，but 转折。"},{"id":"w5-sun-cz6","type":"choice","question":"6___","options":["growing","grow","grows","grew"],"answer":0,"explanation_cn":"keep doing sth：keep growing 继续生长。"}]},{"id":"w5-sun-listening","name_cn":"听力练习","type":"listening","duration":5,"questions":[{"id":"w5-sun-ls1","type":"choice","question":"Which sentence do you hear?","audio_text":"People wrote on oracle bones more than 3000 years ago.","options":["People wrote on oracle bones more than 3000 years ago.","People wrote on paper more than 3000 years ago.","People wrote on oracle bones more than 300 years ago.","People draw on oracle bones more than 3000 years ago."],"answer":0,"explanation_cn":"oracle bones（甲骨），时间 3000 多年前。"},{"id":"w5-sun-ls2","type":"choice","question":"Which sentence do you hear?","audio_text":"There are more than 50000 characters in all.","options":["There are more than 50000 characters in all.","There are more than 5000 characters in all.","There are more than 50000 words in all.","There were more than 50000 characters in all."],"answer":0,"explanation_cn":"数字 50000（五万），in all（总共）。"},{"id":"w5-sun-ls3","type":"choice","question":"Which sentence do you hear?","audio_text":"The character for mountain looked like three peaks.","options":["The character for mountain looked like three peaks.","The character for water looked like three peaks.","The character for mountain looks like three lines.","The word for mountain looked like three peaks."],"answer":0,"explanation_cn":"「山」字像三个山峰，looked like（过去像）。"},{"id":"w5-sun-ls4","type":"choice","question":"Which sentence do you hear?","audio_text":"Calligraphy is the art of writing characters.","options":["Calligraphy is the art of writing characters.","Calligraphy is the game of writing characters.","Calligraphy is the art of drawing pictures.","Photography is the art of writing characters."],"answer":0,"explanation_cn":"calligraphy（书法）是写字的艺术，不是游戏或画画。"},{"id":"w5-sun-ls5","type":"choice","question":"Which sentence do you hear?","audio_text":"With a brush and ink, the characters can dance on the paper.","options":["With a brush and ink, the characters can dance on the paper.","With a pen and ink, the characters can dance on the paper.","With a brush and ink, the children can dance on the paper.","With a brush and ink, the characters can dance on the wall."],"answer":0,"explanation_cn":"工具是 brush and ink（毛笔和墨），地点 on the paper。"}]}]}];

const WEEK6 = [{"day_cn":"周一","day_en":"Monday","is_speaking_day":true,"total_duration":66,"theme_cn":"AI口语 + 高频词汇 + 阅读理解 + 键盘拼写","modules":[{"id":"w6-mon-speaking","name_cn":"AI口语练习","type":"speaking","duration":30,"questions":[{"id":"w6-mon-sp1","type":"choice","sentence":"How do you usually go to school every day?","sentence_cn":"你每天通常怎么去上学？","options":["I usually go to school by bus with my neighbour.","I went to school yesterday morning.","My school is very big and new.","School begins at eight o'clock."],"answer":0,"pronunciation_tips":"usually /ˈjuːʒuəli/ 注意 s 读 /ʒ/，by bus 连读成 /baɪbʌs/","explanation_cn":"问「通常怎么去」，答句要用 usually + 交通方式。A 正确（by bus 坐公交）。B 说的是昨天，时态不对；C、D 说的是学校本身，答非所问。","explanation_en":"The question asks about your usual way of travelling, so answer with 'usually' plus a means of transport. A is correct; B talks about yesterday and C and D describe the school.","answer_cn_hint":"问的是「怎么去」，答句要说出交通方式，比如 by bus、on foot、by bike。","options_cn":["我通常和邻居一起坐公交车去上学。","我昨天早上去上学了。","我的学校又大又新。","学校八点开始上课。"]},{"id":"w6-mon-sp2","type":"choice","sentence":"What job would you like to do after you finish school?","sentence_cn":"你毕业以后想做什么工作？","options":["I want to be a train driver and travel to many cities.","I am a primary school student now.","My father works in a big company.","Growing up takes a long time."],"answer":0,"pronunciation_tips":"driver /ˈdraɪvə/ 注意重音在前，want to 口语里读成 /wɒnə/","explanation_cn":"问将来的理想，答句用 I want to be + 职业。A 正确（train driver 火车司机）。B 说的是现在的身份；C 说的是爸爸；D 没有回答职业。","explanation_en":"The question asks about a future job, so use 'I want to be a ...'. A answers with a job; B describes the present, C talks about the father and D does not answer.","answer_cn_hint":"问「长大想做什么」，答句要说一个职业，比如 teacher、doctor、driver。","options_cn":["我想当火车司机，去很多城市。","我现在是小学生。","我爸爸在一家大公司工作。","长大要花很长时间。"]},{"id":"w6-mon-sp3","type":"choice","sentence":"Which season do you like best, and why?","sentence_cn":"你最喜欢哪个季节？为什么？","options":["I like winter best because I can make a snowman with my friends.","I like it very much, thank you.","There are four seasons in a year.","Last winter was colder than this one."],"answer":0,"pronunciation_tips":"because /bɪˈkɒz/ 重音在后，snowman /ˈsnəʊmæn/ 两个词根都要读清","explanation_cn":"问句有两个部分：哪个季节 + 为什么。A 两个都答了（winter + because）。B 没说季节；C 是常识；D 是比较，没回答最喜欢哪个。","explanation_en":"The question has two parts: which season and why. A answers both with 'winter' and 'because'. B gives no season, C states a fact and D makes a comparison.","answer_cn_hint":"先说我喜欢的季节，再用 because 说一条理由，两个都要说到。","options_cn":["我最喜欢冬天，因为我能和朋友一起堆雪人。","我很喜欢，谢谢。","一年有四个季节。","去年冬天比今年冷。"]},{"id":"w6-mon-sp4","type":"choice","sentence":"Do you prefer paper books or e-books?","sentence_cn":"你更喜欢纸质书还是电子书？","options":["I prefer paper books because I can write notes in them.","I read two books last month.","Books are very expensive in this shop.","My sister has a new phone."],"answer":0,"pronunciation_tips":"prefer /prɪˈfɜː/ 重音在第二音节，paper books 之间稍作停顿","explanation_cn":"这是个选择疑问句（A or B），答句要选一个并给理由。A 选了 paper books 并说明原因。B 说读了几本；C 说价格；D 说的是姐姐的手机。","explanation_en":"This is an either-or question, so choose one side and give a reason. A chooses paper books and explains why; B, C and D do not choose at all.","answer_cn_hint":"问的是二选一，答句先说 I prefer…，再用 because 说理由。","options_cn":["我更喜欢纸质书，因为我可以在上面写笔记。","我上个月读了两本书。","这家店的书很贵。","我姐姐有一部新手机。"]},{"id":"w6-mon-sp5","type":"choice","sentence":"What do you say when your friend feels sad?","sentence_cn":"朋友难过的时候你会说什么？","options":["I say 'Don't worry, I am here with you.'","I said nothing to him yesterday.","Sad films make people cry.","He is my best friend at school."],"answer":0,"pronunciation_tips":"worry /ˈwʌri/ 注意 r 要卷舌，with you 连读 /wɪðjuː/","explanation_cn":"问「你会说什么」，要用直接引语回答具体的一句话。A 给出了一句安慰的话。B 说的是昨天没说话；C 讲电影；D 只是介绍关系。","explanation_en":"The question asks what you actually say, so answer with the words you would use. A gives a comforting sentence; B says you said nothing, C talks about films and D only describes the friendship.","answer_cn_hint":"答句里要有一句真正说出口的安慰话，放在引号里最清楚。","options_cn":["我会说「别担心，我陪着你」。","我昨天什么都没对他说。","悲伤的电影会让人哭。","他是我在学校最好的朋友。"]}]},{"id":"w6-mon-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"railway","phonetic":"/ˈreɪlweɪ/","meaning":"铁路","emoji":"🚄","example_en":"The new railway connects the two cities.","example_cn":"这条新铁路连接两座城市。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🛋️","🚄","🧳","🕐"],"answer":1},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🚄","🧳","🚉","🕐"],"answer":0},{"type":"meaning_choice","prompt":"railway 是什么意思？（1/2）","options":["舒适的","铁路","乘客","站台"],"answer":1},{"type":"meaning_choice","prompt":"railway 是什么意思？（2/2）","options":["铁路","乘客","站台","舒适的"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: ra__way","answer":"il"}],"letters":["r","a","i","l","w","a","y"],"syllables":["rail","way"],"hint_cn":"火车走的那条特别长的路"},{"word":"passenger","phonetic":"/ˈpæsɪndʒə/","meaning":"乘客","emoji":"🧳","example_en":"Every passenger must wear a seat belt.","example_cn":"每位乘客都必须系好安全带。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🚉","🕐","🛋️","🧳"],"answer":3},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🛋️","🚉","🧳","🚄"],"answer":2},{"type":"meaning_choice","prompt":"passenger 是什么意思？（1/2）","options":["乘客","铁路","时刻表","舒适的"],"answer":0},{"type":"meaning_choice","prompt":"passenger 是什么意思？（2/2）","options":["铁路","时刻表","乘客","舒适的"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: pas__nger","answer":"se"}],"letters":["p","a","s","s","e","n","g","e","r"],"syllables":["pas","sen","ger"],"hint_cn":"坐车坐船坐飞机的人"},{"word":"platform","phonetic":"/ˈplætfɔːm/","meaning":"站台","emoji":"🚉","example_en":"The train to Shanghai leaves from platform three.","example_cn":"去上海的火车从三号站台出发。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🕐","🧳","🚉","🛋️"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🛋️","🚉","🕐","🚄"],"answer":1},{"type":"meaning_choice","prompt":"platform 是什么意思？（1/2）","options":["铁路","乘客","站台","舒适的"],"answer":2},{"type":"meaning_choice","prompt":"platform 是什么意思？（2/2）","options":["乘客","站台","时刻表","铁路"],"answer":1},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: pla__orm","answer":"tf"}],"letters":["p","l","a","t","f","o","r","m"],"syllables":["plat","form"],"hint_cn":"在车站等车时站的那块高台"},{"word":"timetable","phonetic":"/ˈtaɪmteɪbl/","meaning":"时刻表","emoji":"🕐","example_en":"Look at the timetable to find your train.","example_cn":"看看时刻表找到你的那趟车。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🚉","🧳","🕐","🚄"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🛋️","🕐","🚉","🧳"],"answer":1},{"type":"meaning_choice","prompt":"timetable 是什么意思？（1/2）","options":["舒适的","铁路","时刻表","乘客"],"answer":2},{"type":"meaning_choice","prompt":"timetable 是什么意思？（2/2）","options":["站台","铁路","乘客","时刻表"],"answer":3},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: tim__able","answer":"et"}],"letters":["t","i","m","e","t","a","b","l","e"],"syllables":["time","ta","ble"],"hint_cn":"写着几点几分有什么车的一张表"},{"word":"comfortable","phonetic":"/ˈkʌmftəbl/","meaning":"舒适的","emoji":"🛋️","example_en":"These new seats are very comfortable.","example_cn":"这些新座位非常舒适。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🚉","🧳","🛋️","🕐"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🛋️","🚄","🚉","🧳"],"answer":0},{"type":"meaning_choice","prompt":"comfortable 是什么意思？（1/2）","options":["站台","舒适的","时刻表","乘客"],"answer":1},{"type":"meaning_choice","prompt":"comfortable 是什么意思？（2/2）","options":["乘客","舒适的","铁路","时刻表"],"answer":1},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: comf__table","answer":"or"}],"letters":["c","o","m","f","o","r","t","a","b","l","e"],"syllables":["com","fort","a","ble"],"hint_cn":"坐着软软的，一点也不累"}]},{"id":"w6-mon-grammar","name_cn":"冠词 a / an","type":"grammar","duration":10,"questions":[{"id":"w6-mon-gr1","type":"fill","question":"用 a 或 an 填空：___ bike","answer":"a","explanation_cn":"bike /baɪk/ 以辅音音素 /b/ 开头，前面用 a。"},{"id":"w6-mon-gr2","type":"fill","question":"用 a 或 an 填空：___ umbrella","answer":"an","explanation_cn":"umbrella /ʌmˈbrelə/ 以元音音素 /ʌ/ 开头，用 an。"},{"id":"w6-mon-gr3","type":"fill","question":"用 a 或 an 填空：___ university","answer":"a","explanation_cn":"university 虽以元音字母 u 开头，但读 /juː/，是辅音音素，所以用 a。"},{"id":"w6-mon-gr4","type":"fill","question":"用 a 或 an 填空：___ honest boy","answer":"an","explanation_cn":"honest 里的 h 不发音，读 /ˈɒnɪst/，元音音素开头 → an。"}]},{"id":"w6-mon-writing","name_cn":"背诵作文","type":"writing_template","duration":15,"title":"A letter to a friend（给朋友的一封信）","requirement_cn":"先把整封信大声读三遍，再把 5 个空填好，最后背诵全文。这是本周的背诵任务！","keywords":["swimming","exercise","entrance","bike","idea"],"keywords_cn":["游泳","锻炼","入口","自行车","主意"],"template":"Dear Toni,\nI'm writing to you because I'm going {{1}} this Saturday. Would you like to come with me? It would be great to do some {{2}} at the weekend. The swimming pool is at the stadium downtown, and we can meet at the {{3}}. I will go there by {{4}} because the weather will be good on Saturday. Let me know your {{5}}. I hope to see you there.\nLuca","blanks":[{"id":1,"hint_cn":"游泳","hint_en":"swimming","answer":"swimming"},{"id":2,"hint_cn":"锻炼","hint_en":"exercise","answer":"exercise"},{"id":3,"hint_cn":"入口","hint_en":"entrance","answer":"entrance"},{"id":4,"hint_cn":"自行车","hint_en":"bike","answer":"bike"},{"id":5,"hint_cn":"主意","hint_en":"idea","answer":"idea"}],"full_text":"Dear Toni,\nI'm writing to you because I'm going swimming this Saturday. Would you like to come with me? It would be great to do some exercise at the weekend. The swimming pool is at the stadium downtown, and we can meet at the entrance. I will go there by bike because the weather will be good on Saturday. Let me know your idea. I hope to see you there.\nLuca","full_text_cn":"亲爱的Toni：\n我写信给你是因为这周六我要去游泳。你愿意和我一起来吗？周末做些锻炼真是太好了。游泳池在市中心的体育馆里，我们可以在体育馆的入口处碰面。我打算骑自行车去，因为周六天气会很好。告诉我你的想法吧。希望在那儿见到你。\nLuca","explanation_cn":"背诵重点短语：would like to（想要）· come with me（跟我一起来）· do some exercise（做锻炼）· at the weekend（在周末）· by bike（骑自行车）· let me know（告诉我）。写信结构：开头 I'm writing to you because… 说明缘由 → 中间约时间地点（We can meet at…）→ 结尾 I hope to see you there. 表达期待。","explanation_en":"A short invitation letter: reason (because), plan (would like to / by bike), meeting point (meet at the entrance), and a friendly closing (Let me know / I hope to see you there)."},{"id":"w6-mon-kb","name_cn":"今天学的词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w6-mon-kb1","type":"fill","question":"铁路：r______ [填完整单词]","answer":"railway","explanation_cn":"railway = rail（铁轨）+ way（路），读 /ˈreɪlweɪ/。"},{"id":"w6-mon-kb2","type":"fill","question":"乘客：p________ [填完整单词]","answer":"passenger","explanation_cn":"passenger 中间是 ss 和 ng，词尾 er，读 /ˈpæsɪndʒə/。"},{"id":"w6-mon-kb3","type":"fill","question":"站台：p_______ [填完整单词]","answer":"platform","explanation_cn":"platform = plat + form，读 /ˈplætfɔːm/。"},{"id":"w6-mon-kb4","type":"fill","question":"时刻表：t________ [填完整单词]","answer":"timetable","explanation_cn":"time + table 合成一个词，中间不空格。"}]}]},{"day_cn":"周二","day_en":"Tuesday","is_speaking_day":false,"total_duration":32,"theme_cn":"作文跟读 + 阅读理解 + 语法练习 + 听力对话 + 键盘拼写","modules":[{"id":"w6-tue-wd","name_cn":"作文跟读 · 背诵","type":"writing_drill","duration":6,"title":"第 1~3 句 · 开头与邀请","focus_cn":"先把 I'm writing to you because… 读顺，再接住邀请句","full_text":"Dear Toni, I'm writing to you because I'm going swimming this Saturday. Would you like to come with me? It would be great to do some exercise at the weekend.","cn_list":["亲爱的Toni，我写信给你是因为这周六我要去游泳。","你愿意和我一起来吗？","周末做些锻炼真是太好了。"],"full_text_cn":"亲爱的Toni，我写信给你是因为这周六我要去游泳。你愿意和我一起来吗？周末做些锻炼真是太好了。","pass_score":60},{"id":"w6-tue-reading","name_cn":"阅读理解","type":"reading","duration":10,"passage":"In China, many people pay with their phones instead of cash. You open a payment app, scan the QR code in the shop and type the amount, and the money leaves your wallet in a second. Small shops like this way because they do not need to keep much change. Even people who sell vegetables in the street use it. Some grandparents find it hard at first, so their children teach them step by step. Now they can buy breakfast with a single tap, and they no longer worry about losing money on the way home.","passage_cn":"在中国，很多人用手机付款而不是现金。你打开支付软件，扫一下店里的二维码，再输入金额，钱一秒钟就从钱包里出去了。小店喜欢这种方式，因为不用准备很多零钱。连在街边卖菜的人也在用。有些爷爷奶奶一开始觉得难，所以孩子们一步一步教他们。现在他们点一下就能买到早餐，也不用再担心回家路上把钱弄丢。","questions":[{"id":"w6-tue-rd1","type":"choice","question":"What do many people in China use to pay?","options":["Their phones","Only paper money","Bank cards only","Coins"],"answer":0,"explanation_cn":"第一句：many people pay with their phones instead of cash。"},{"id":"w6-tue-rd2","type":"choice","question":"What do you scan in the shop?","options":["The QR code","The window","The menu","The receipt"],"answer":0,"explanation_cn":"第二句：scan the QR code in the shop（扫店里的二维码）。"},{"id":"w6-tue-rd3","type":"choice","question":"Why do small shops like paying by phone?","options":["They do not need to keep much change.","The phone is cheaper than food.","They can close earlier.","Customers must pay more."],"answer":0,"explanation_cn":"第四句：they do not need to keep much change（不用备很多零钱）。"},{"id":"w6-tue-rd4","type":"choice","question":"Who teaches the grandparents to use the app?","options":["Their children","Their teachers","The shopkeepers","Nobody"],"answer":0,"explanation_cn":"倒数第二句：their children teach them step by step。"}]},{"id":"w6-tue-mc","name_cn":"some / any · there be","type":"multiple_choice","duration":5,"questions":[{"id":"w6-tue-mc1","type":"fill","question":"I can't find ___ skirts I like.","answer":"any","explanation_cn":"can't find 是否定，否定句用 any。"},{"id":"w6-tue-mc2","type":"fill","question":"Why don't we buy ___ books?","answer":"some","explanation_cn":"Why don't we…? 是提建议，期待对方答应，这种问句用 some。"},{"id":"w6-tue-mc3","type":"fill","question":"用 is / isn't / are / aren't + a / an / some / any 填空：There ___ apples.","answer":"are some","explanation_cn":"apples 复数 → are；肯定句 → some。"}]},{"id":"w6-tue-listening","name_cn":"听力：听对话 + 听写填空","type":"listening","duration":5,"questions":[{"id":"w6-tue-ls1","type":"choice","question":"Listen to the dialogue. How much is the story book?","audio_text":"Boy: How much is this story book? Woman: It's twenty yuan. You can scan the code on the desk. Boy: Great, I'll pay with my phone.","options":["Twenty yuan","Twelve yuan","Thirty yuan","Two yuan"],"answer":0,"explanation_cn":"售货员说 It's twenty yuan（二十元），注意 twenty 和 twelve 的读音差别。"},{"id":"w6-tue-ls2","type":"choice","question":"Listen to the dialogue. What does Grandma think of the app at last?","audio_text":"Grandma: I really don't know how to use this app. Boy: Don't worry, Grandma. Just scan the code and type the amount. Grandma: Oh, it's much easier than I thought.","options":["Easier than she thought","Too expensive for her","Too slow to use","Dangerous for old people"],"answer":0,"explanation_cn":"奶奶最后说 much easier than I thought（比我原来想的容易多了），这是问「后来觉得怎么样」的答案。"},{"id":"w6-tue-ls3","type":"fill","question":"Listen and fill in the blank: Small shops do not need to keep much ___.","audio_text":"Small shops do not need to keep much change.","answer":"change","explanation_cn":"听到的是 keep much change（备很多零钱），change 在这里是「零钱」的意思。"},{"id":"w6-tue-ls4","type":"fill","question":"Listen and fill in the blank: The money leaves your ___ in a second.","audio_text":"The money leaves your wallet in a second.","answer":"wallet","explanation_cn":"听到的是 leaves your wallet（离开你的钱包），wallet 读 /ˈwɒlɪt/。"}]},{"id":"w6-tue-kb","name_cn":"支付常用词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w6-tue-kb1","type":"fill","question":"移动的：m______ [填完整单词]","answer":"mobile","explanation_cn":"mobile phone 就是手机；mobile 读 /ˈməʊbaɪl/，重音在前。"},{"id":"w6-tue-kb2","type":"fill","question":"金额：a_____ [填完整单词]","answer":"amount","explanation_cn":"amount 指金额，读 /əˈmaʊnt/；type the amount 就是输入金额。"},{"id":"w6-tue-kb3","type":"fill","question":"收到：r______ [填完整单词]","answer":"receive","explanation_cn":"receive 遵守 i 在 e 前的规则（ei），读 /rɪˈsiːv/。"},{"id":"w6-tue-kb4","type":"fill","question":"账户：a______ [填完整单词]","answer":"account","explanation_cn":"account 有两个 c 连写，读 /əˈkaʊnt/。"}]}]},{"day_cn":"周三","day_en":"Wednesday","is_speaking_day":true,"total_duration":67,"theme_cn":"作文跟读 + AI口语 + 高频词汇 + Exercise 01 专项（猜词/字谜/词组）","modules":[{"id":"w6-wed-wd","name_cn":"作文跟读 · 背诵","type":"writing_drill","duration":6,"title":"第 3~5 句 · 主体（锻炼 · 地点 · 交通）","focus_cn":"这三句最长，读慢一点：at the stadium / by bike 别吞音","full_text":"It would be great to do some exercise at the weekend. The swimming pool is at the stadium downtown, and we can meet at the entrance. I will go there by bike because the weather will be good on Saturday.","cn_list":["周末做些锻炼真是太好了。","游泳池在市中心的体育馆里，我们可以在入口处碰面。","我打算骑自行车去，因为周六天气会很好。"],"full_text_cn":"周末做些锻炼真是太好了。游泳池在市中心的体育馆里，我们可以在入口处碰面。我打算骑自行车去，因为周六天气会很好。","pass_score":60},{"id":"w6-wed-speaking","name_cn":"AI口语练习","type":"speaking","duration":30,"questions":[{"id":"w6-wed-sp1","type":"choice","sentence":"What is your favourite festival? Tell me about it.","sentence_cn":"你最喜欢的节日是什么？说一说。","options":["My favourite festival is the Spring Festival, because the whole family eats together.","There are many festivals in China.","I was very busy last week.","My birthday is in June."],"answer":0,"pronunciation_tips":"favourite /ˈfeɪvərɪt/ 三个音节，because 后面稍作停顿再说理由","explanation_cn":"问「最喜欢的节日，并说一说」，答句要说出节日名 + 一两句说明。A 说了 Spring Festival 和原因；B 只是泛泛而谈；C、D 跟节日无关。","explanation_en":"The question asks for one festival plus some details. A names the Spring Festival and gives a reason; B only says festivals exist and C and D are off topic.","answer_cn_hint":"先说节日的名字，再说为什么喜欢它，最好提到人和活动。","options_cn":["我最喜欢的节日是春节，因为全家人一起吃饭。","中国有很多节日。","我上周很忙。","我的生日在六月。"]},{"id":"w6-wed-sp2","type":"choice","sentence":"How do you help your parents at home?","sentence_cn":"你在家怎么帮父母？","options":["I wash the dishes after dinner and walk the dog on Sundays.","My parents are both very busy.","We live in a small flat.","I helped them last year."],"answer":0,"pronunciation_tips":"dishes /ˈdɪʃɪz/ 词尾读 /ɪz/，walk the dog 连读自然","explanation_cn":"问「怎么帮」，要用一般现在时说出一两件具体的事。A 举了洗碗和遛狗。B 说父母忙；C 说住哪里；D 说的是去年。","explanation_en":"The question asks how you help, so list one or two regular chores in the simple present. A gives two clear examples; B, C and D do not describe help.","answer_cn_hint":"答句里要有动作，比如 wash the dishes、clean the room、walk the dog。","options_cn":["晚饭后我洗碗，星期天我去遛狗。","我父母都很忙。","我们住在一套小公寓里。","我去年帮过他们。"]},{"id":"w6-wed-sp3","type":"choice","sentence":"How was your last weekend? What did you do?","sentence_cn":"你上周末过得怎么样？做了什么？","options":["I went hiking with my cousin and took many photos.","I usually do my homework on Saturday.","I will visit my grandma next week.","Weekends are shorter than holidays."],"answer":0,"pronunciation_tips":"hiking /ˈhaɪkɪŋ/ 注意 i 读 /aɪ/，went 与 and 之间可弱读","explanation_cn":"last weekend 是过去时间，答句用过去式。A 用 went / took。B 用一般现在时；C 说下周；D 是观点。","explanation_en":"Last weekend is in the past, so the answer needs the past tense. A uses 'went' and 'took'; B uses the present, C talks about next week and D gives an opinion.","answer_cn_hint":"问的是上周末，动词要用过去式，比如 went、played、visited。","options_cn":["我和表哥去爬山，拍了很多照片。","我通常星期六做作业。","我下周要去看外婆。","周末比假期短。"]},{"id":"w6-wed-sp4","type":"choice","sentence":"Which is better for you, studying in the morning or in the evening?","sentence_cn":"对你来说，早上学习好还是晚上学习好？","options":["Studying in the morning is better for me because my head is clear.","I study every day after school.","My desk is next to the window.","Evening comes after the afternoon."],"answer":0,"pronunciation_tips":"clear /klɪə/ 注意 l 音要发出来，because 重音在第二音节","explanation_cn":"二选一的问题要先选一个再给理由。A 选了 morning 并说明 head is clear。B 没说哪个更好；C、D 无关。","explanation_en":"An either-or question needs a choice plus a reason. A chooses the morning and explains why; B does not compare, and C and D are unrelated.","answer_cn_hint":"先明确选一个（A is better for me），再用 because 说一条理由。","options_cn":["早上学习对我更好，因为我头脑清醒。","我每天放学后都学习。","我的书桌在窗边。","晚上在下午之后。"]},{"id":"w6-wed-sp5","type":"choice","sentence":"What should we do to keep our classroom clean?","sentence_cn":"要保持教室干净，我们应该怎么做？","options":["We should put rubbish in the bin and clean the desks every day.","Our classroom is on the second floor.","I cleaned it yesterday with Tom.","The teacher is very strict with us."],"answer":0,"pronunciation_tips":"rubbish /ˈrʌbɪʃ/ 注意重音在前，should 词尾 d 不发音","explanation_cn":"should 提问建议，回答用 We should + 动词原形。A 给了两条建议。B 说位置；C 说昨天做过；D 说老师严格。","explanation_en":"The question asks for advice, so answer with 'We should + base verb'. A gives two suggestions; B, C and D do not offer advice.","answer_cn_hint":"用 We should + 动词原形给出建议，说两条就更完整。","options_cn":["我们应该把垃圾放进垃圾桶，每天擦桌子。","我们教室在二楼。","我昨天和汤姆打扫过。","老师对我们很严格。"]}]},{"id":"w6-wed-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"calendar","phonetic":"/ˈkælɪndə/","meaning":"日历","emoji":"📅","example_en":"I marked the exam day on my calendar.","example_cn":"我在日历上标出了考试那天。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🌾","🏮","📅","🧺"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🏮","📅","🧺","🌾"],"answer":1},{"type":"meaning_choice","prompt":"calendar 是什么意思？（1/2）","options":["传统","谷物","习俗","日历"],"answer":3},{"type":"meaning_choice","prompt":"calendar 是什么意思？（2/2）","options":["习俗","谷物","日历","收获"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: cal__dar","answer":"en"}],"letters":["c","a","l","e","n","d","a","r"],"syllables":["cal","en","dar"],"hint_cn":"一个月一个月排下来的那张纸"},{"word":"harvest","phonetic":"/ˈhɑːvɪst/","meaning":"收获","emoji":"🧺","example_en":"The farmers had a good harvest this autumn.","example_cn":"今年秋天农民收成很好。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🌾","🏮","📅","🧺"],"answer":3},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["📅","🎎","🧺","🏮"],"answer":2},{"type":"meaning_choice","prompt":"harvest 是什么意思？（1/2）","options":["收获","习俗","传统","谷物"],"answer":0},{"type":"meaning_choice","prompt":"harvest 是什么意思？（2/2）","options":["谷物","收获","传统","习俗"],"answer":1},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: ha__est","answer":"rv"}],"letters":["h","a","r","v","e","s","t"],"syllables":["har","vest"],"hint_cn":"秋天把庄稼收回家"},{"word":"grain","phonetic":"/ɡreɪn/","meaning":"谷物","emoji":"🌾","example_en":"Rice is an important grain in Asia.","example_cn":"稻米是亚洲重要的谷物。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🏮","📅","🎎","🌾"],"answer":3},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🎎","🧺","🌾","📅"],"answer":2},{"type":"meaning_choice","prompt":"grain 是什么意思？（1/2）","options":["日历","习俗","谷物","收获"],"answer":2},{"type":"meaning_choice","prompt":"grain 是什么意思？（2/2）","options":["谷物","收获","习俗","传统"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: g__in","answer":"ra"}],"letters":["g","r","a","i","n"],"syllables":["grain"],"hint_cn":"磨成面粉做馒头的小颗粒"},{"word":"tradition","phonetic":"/trəˈdɪʃn/","meaning":"传统","emoji":"🏮","example_en":"Eating dumplings at New Year is a Chinese tradition.","example_cn":"过年吃饺子是中国的传统。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🎎","🏮","🧺","🌾"],"answer":1},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🧺","🏮","📅","🌾"],"answer":1},{"type":"meaning_choice","prompt":"tradition 是什么意思？（1/2）","options":["习俗","日历","传统","收获"],"answer":2},{"type":"meaning_choice","prompt":"tradition 是什么意思？（2/2）","options":["谷物","收获","传统","日历"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: tra__tion","answer":"di"}],"letters":["t","r","a","d","i","t","i","o","n"],"syllables":["tra","di","tion"],"hint_cn":"一代一代传下来的做法"},{"word":"custom","phonetic":"/ˈkʌstəm/","meaning":"习俗","emoji":"🎎","example_en":"Giving red packets is a popular custom in my town.","example_cn":"发红包在我们这儿是很流行的习俗。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🧺","🏮","🎎","🌾"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🎎","🏮","🧺","🌾"],"answer":0},{"type":"meaning_choice","prompt":"custom 是什么意思？（1/2）","options":["传统","习俗","收获","日历"],"answer":1},{"type":"meaning_choice","prompt":"custom 是什么意思？（2/2）","options":["习俗","收获","日历","谷物"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: cu__om","answer":"st"}],"letters":["c","u","s","t","o","m"],"syllables":["cus","tom"],"hint_cn":"一个地方大家习惯了的做法"}]},{"id":"w6-wed-mc","name_cn":"Exercise 01 · 猜单词","type":"multiple_choice","duration":5,"questions":[{"id":"w6-wed-mc1","type":"choice","question":"It's a place where planes land and take off. What is it?","options":["an airport 机场","an address 地址","an actor 演员","an agent 代理人"],"answer":0,"explanation_cn":"land 着陆、take off 起飞 → airport 机场。"},{"id":"w6-wed-mc2","type":"choice","question":"If you want to send someone a letter, you will need this. What is it?","options":["an address 地址","an airport 机场","an egg 鸡蛋","an activity 活动"],"answer":0,"explanation_cn":"寄信一定要写上地址 → address 地址。"},{"id":"w6-wed-mc3","type":"choice","question":"You can see these people on television or in films. Who are they?","options":["actors 演员","farmers 农民","pilots 飞行员","agents 代理人"],"answer":0,"explanation_cn":"电视和电影里演的人 → actors 演员。"},{"id":"w6-wed-mc4","type":"choice","question":"It's a big machine with wings and engines and it can fly. What is it?","options":["an aeroplane 飞机","an underground 地铁","an umbrella 雨伞","an insect 昆虫"],"answer":0,"explanation_cn":"wings 机翼、engines 发动机、还会飞 → aeroplane 飞机。"},{"id":"w6-wed-mc5","type":"choice","question":"A person whose job is to manage the affairs of other people. Who is it?","options":["an agent 代理人","an actor 演员","an engineer 工程师","an artist 艺术家"],"answer":0,"explanation_cn":"替别人打理事务的人 → agent 经纪人／代理人。"}]},{"id":"w6-wed-grammar","name_cn":"Exercise 01 · 词组补充","type":"grammar","duration":10,"questions":[{"id":"w6-wed-gr1","type":"fill","question":"选词补全词组（词库：animals / activities / advanced / answer / able）：野生动物 wild ___","answer":"animals","explanation_cn":"wild animals 野生动物；这里说一群野生动物，animal 要用复数 animals。"},{"id":"w6-wed-gr2","type":"fill","question":"选词补全词组（词库：animals / activities / advanced / answer / able）：高级课程 ___ course","answer":"advanced","explanation_cn":"advanced course 高级课程；advanced 高级的、进阶的。"},{"id":"w6-wed-gr3","type":"fill","question":"选词补全词组（词库：animals / activities / advanced / answer / able）：有能力做某事 be ___ to do sth","answer":"able","explanation_cn":"be able to do sth 有能力做某事，意思和 can 很近：I am able to swim = I can swim。"},{"id":"w6-wed-gr4","type":"fill","question":"选词补全词组（词库：animals / activities / advanced / answer / able）：课堂活动 classroom ___","answer":"activities","explanation_cn":"classroom activities 课堂活动；activity 变复数要 y 变 i 加 es：activities。"},{"id":"w6-wed-gr5","type":"fill","question":"选词补全词组（词库：animals / activities / advanced / answer / able）：回答问题 ___ questions","answer":"answer","explanation_cn":"answer questions 回答问题；answer 也可以作名词：the answer to this question 这个问题的答案。"}]},{"id":"w6-wed-choice2","name_cn":"字谜填词","type":"multiple_choice","duration":5,"questions":[{"id":"w6-wed-mcq1","type":"fill","question":"字谜串 bangryappleacrossalready（里面藏着 angry 生气 / apple 苹果 / across 穿过 / already 已经）。I like ___, but I don't like oranges.","answer":"apples","explanation_cn":"藏在串里的是 apple，但 like 后可数名词要用复数表示一类：I like apples。"},{"id":"w6-wed-mcq2","type":"fill","question":"字谜串 bangryappleacrossalready（里面藏着 angry 生气 / apple 苹果 / across 穿过 / already 已经）。In some countries, red is an ___ colour.","answer":"angry","explanation_cn":"an 后面接元音音素开头的词：angry。红色是一种\"让人着急\"的颜色。"},{"id":"w6-wed-mcq3","type":"fill","question":"字谜串 bangryappleacrossalready（里面藏着 angry 生气 / apple 苹果 / across 穿过 / already 已经）。Before humans lived on the earth, whales ___ lived in the sea.","answer":"already","explanation_cn":"already 已经——人类出现之前，鲸鱼早就住在大海里了。"},{"id":"w6-wed-mcq4","type":"fill","question":"字谜串 bangryappleacrossalready（里面藏着 angry 生气 / apple 苹果 / across 穿过 / already 已经）。The library is ___ from the cinema.","answer":"across","explanation_cn":"across from 在……对面：图书馆在电影院对面。"}]},{"id":"w6-wed-kb","name_cn":"Exercise 01 词组，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w6-wed-kb1","type":"fill","question":"害怕：a______ [填完整单词]","answer":"afraid","explanation_cn":"整条词组是 be afraid of（害怕……）。afraid 读音 /əˈfreɪd/，只能用在 be 动词后面。"},{"id":"w6-wed-kb2","type":"fill","question":"同意：a_____ [填完整单词]","answer":"agree","explanation_cn":"整条词组是 agree with sb（同意某人）。agree 读音 /əˈɡriː/。"},{"id":"w6-wed-kb3","type":"fill","question":"很久以前：a__ [填完整单词]","answer":"ago","explanation_cn":"整条词组是 a long time ago（很久以前），ago 要放在时间词的后面。"}]}]},{"day_cn":"周四","day_en":"Thursday","is_speaking_day":false,"total_duration":32,"theme_cn":"作文跟读 + 阅读理解 + 语法练习 + 听力（选图 / 问答 / 听写）+ 键盘拼写","modules":[{"id":"w6-thu-wd","name_cn":"作文跟读 · 背诵","type":"writing_drill","duration":6,"title":"第 5~7 句 · 结尾（回复与期待）","focus_cn":"Let me know your idea. 和 I hope to see you there. 要能脱口而出","full_text":"I will go there by bike because the weather will be good on Saturday. Let me know your idea. I hope to see you there.","cn_list":["我打算骑自行车去，因为周六天气会很好。","告诉我你的想法吧。","希望在那儿见到你。"],"full_text_cn":"我打算骑自行车去，因为周六天气会很好。告诉我你的想法吧。希望在那儿见到你。","pass_score":60},{"id":"w6-thu-reading","name_cn":"阅读理解","type":"reading","duration":10,"passage":"Paper cutting is one of China's oldest folk arts. People use red paper and a pair of scissors to cut out flowers, animals and Chinese characters. The art is more than 1500 years old, and it is still popular in villages today. During the Spring Festival, families put red paper cuttings on windows and doors for good luck. Each pattern has its own meaning: a fish stands for a rich year, and a peach stands for long life. Learning paper cutting takes patience, but children love it because a plain sheet of paper can become a beautiful picture in a few minutes.","passage_cn":"剪纸是中国最古老的民间艺术之一。人们用红纸和一把剪刀剪出花、动物和汉字。这门艺术有一千五百多年历史，今天在乡村依然流行。春节期间，家家户户把红色剪纸贴在窗户和门上，图个吉利。每种图案都有自己的含义：鱼代表年年有余，桃子代表长寿。学剪纸需要耐心，但孩子们很喜欢，因为一张普通的纸几分钟就能变成一幅漂亮的画。","questions":[{"id":"w6-thu-rd1","type":"choice","question":"What do people use to cut the paper?","options":["A pair of scissors","A ruler","A brush","A spoon"],"answer":0,"explanation_cn":"第二句：use red paper and a pair of scissors to cut out...（用红纸和一把剪刀剪出）。"},{"id":"w6-thu-rd2","type":"choice","question":"How old is the art of paper cutting?","options":["More than 1500 years","More than 150 years","About 50 years","About 100 years"],"answer":0,"explanation_cn":"第三句：The art is more than 1500 years old。"},{"id":"w6-thu-rd3","type":"choice","question":"Where do families put paper cuttings at Spring Festival?","options":["On windows and doors","Under the bed","In the garden","On the car"],"answer":0,"explanation_cn":"第四句：put red paper cuttings on windows and doors for good luck。"},{"id":"w6-thu-rd4","type":"choice","question":"What does a fish stand for in paper cutting?","options":["A rich year","Long life","Good weather","A big house"],"answer":0,"explanation_cn":"第五句：a fish stands for a rich year（鱼代表年年有余）。"}]},{"id":"w6-thu-mc","name_cn":"there be + a/an/some/any","type":"multiple_choice","duration":5,"questions":[{"id":"w6-thu-mc1","type":"fill","question":"用 is / isn't / are / aren't + a / an / some / any 填空：There ___ grapes.","answer":"aren't any","explanation_cn":"grapes 复数 → aren't；否定 → any。"},{"id":"w6-thu-mc2","type":"fill","question":"用 is / isn't / are / aren't + a / an / some / any 填空：There ___ eggs.","answer":"are some","explanation_cn":"eggs 复数肯定 → are some。"},{"id":"w6-thu-mc3","type":"fill","question":"用 is / isn't / are / aren't + a / an / some / any 填空：There ___ onion.","answer":"is an","explanation_cn":"onion 单数可数，/ˈʌnjən/ 元音音素开头 → an。"}]},{"id":"w6-thu-listening","name_cn":"听力：选图 + 问答 + 听写","type":"listening","duration":5,"questions":[{"id":"w6-thu-ls1","type":"choice","question":"Which picture matches the sentence you hear?","audio_text":"Look at the paper fish on the window. It means a rich year.","options":["🐟","🍑","✂️","🌺"],"picture_options":true,"answer":0,"explanation_cn":"句子里说的是 paper fish（纸鱼），所以选 🐟；桃子和剪刀是另外两句里出现的。"},{"id":"w6-thu-ls2","type":"choice","question":"Which picture matches the sentence you hear?","audio_text":"My sister is cutting the red paper with a pair of scissors.","options":["✂️","🖌️","📏","🔪"],"picture_options":true,"answer":0,"explanation_cn":"关键工具是 a pair of scissors（一把剪刀），所以选 ✂️。"},{"id":"w6-thu-ls3","type":"choice","question":"Listen to the dialogue. What does Grandma's paper peach mean?","audio_text":"Boy: What are you making, Grandma? Grandma: I'm cutting a peach for your birthday. It means long life.","options":["Long life","Good luck","A rich year","A new job"],"answer":0,"explanation_cn":"奶奶说 It means long life（代表长寿）。good luck 是贴窗花的用意，a rich year 是鱼的含义。"},{"id":"w6-thu-ls4","type":"fill","question":"Listen and fill in the blank: Families put red paper cuttings on the windows for good ___.","audio_text":"Families put red paper cuttings on the windows for good luck.","answer":"luck","explanation_cn":"听到的是 for good luck（图个吉利），luck 读 /lʌk/。"}]},{"id":"w6-thu-kb","name_cn":"剪纸这课的字，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w6-thu-kb1","type":"fill","question":"剪刀：s________ [填完整单词]","answer":"scissors","explanation_cn":"scissors 永远是复数形式，a pair of scissors 才是一把剪刀。"},{"id":"w6-thu-kb2","type":"fill","question":"图案：p______ [填完整单词]","answer":"pattern","explanation_cn":"pattern 有两个 t 连写，读 /ˈpætn/。"},{"id":"w6-thu-kb3","type":"fill","question":"耐心：p_______ [填完整单词]","answer":"patience","explanation_cn":"patience 结尾是 ence，读 /ˈpeɪʃns/，注意不是 patient。"},{"id":"w6-thu-kb4","type":"fill","question":"窗户：w______ [填完整单词]","answer":"window","explanation_cn":"window 中间的 n 不发音，读 /ˈwɪndəʊ/。"}]}]},{"day_cn":"周五","day_en":"Friday","is_speaking_day":false,"total_duration":47,"theme_cn":"作文跟读 + 模板写作 + KET/PET题型 + 语法复习 + 听力 + 键盘拼写","modules":[{"id":"w6-fri-wd","name_cn":"作文跟读 · 背诵","type":"writing_drill","duration":6,"title":"关键句抽读（开头 · 集合地点 · 结尾）","focus_cn":"专挑长句：读到不打结，才算真的会了","full_text":"Dear Toni, I'm writing to you because I'm going swimming this Saturday. The swimming pool is at the stadium downtown, and we can meet at the entrance. I hope to see you there.","cn_list":["亲爱的Toni，我写信给你是因为这周六我要去游泳。","游泳池在市中心的体育馆里，我们可以在入口处碰面。","希望在那儿见到你。"],"full_text_cn":"亲爱的Toni，我写信给你是因为这周六我要去游泳。游泳池在市中心的体育馆里，我们可以在入口处碰面。希望在那儿见到你。","pass_score":60},{"id":"w6-fri-mc","name_cn":"How much / How many","type":"multiple_choice","duration":5,"questions":[{"id":"w6-fri-mc1","type":"choice","question":"___ sweets would you like? — A lot. I love them!","options":["How much","How many","How long","How often"],"answer":1,"explanation_cn":"sweets 糖果，可数复数 → How many；回答 A lot。"},{"id":"w6-fri-mc2","type":"choice","question":"___ bananas do you eat in a week? — Only a few. One or two, maybe.","options":["How much","How many","How long","How often"],"answer":1,"explanation_cn":"bananas 可数复数 → How many；回答用 a few（修饰可数）。"},{"id":"w6-fri-mc3","type":"choice","question":"___ pasta would you like? — Just a little. I'm not very hungry.","options":["How much","How many","How long","How often"],"answer":0,"explanation_cn":"pasta 意面，不可数 → How much；a little 修饰不可数名词。"},{"id":"w6-fri-mc4","type":"choice","question":"___ ice cream would you like? — A little, please. It's my favourite!","options":["How much","How many","How long","How often"],"answer":0,"explanation_cn":"ice cream 这里按不可数用 → How much；A little 一点点。"},{"id":"w6-fri-mc5","type":"choice","question":"___ bread have we got? — Only a little. We need to buy some.","options":["How much","How many","How long","How often"],"answer":0,"explanation_cn":"bread 面包，不可数 → How much。"},{"id":"w6-fri-mc6","type":"choice","question":"___ oranges are you going to buy? — None. I haven't got any money in my bag.","options":["How much","How many","How long","How often"],"answer":1,"explanation_cn":"oranges 可数复数 → How many；None 一个也没有。"}]},{"id":"w6-fri-grammar","name_cn":"改错小医生","type":"grammar","duration":10,"questions":[{"id":"w6-fri-gr1","type":"choice","question":"改错：Both of us is students. 哪个改法是对的？","options":["is→are","us→we","of→for","students→student"],"answer":0,"explanation_cn":"both of us / both of them… 作主语是复数概念，动词用 are。"},{"id":"w6-fri-gr2","type":"choice","question":"改错：There aren't some apples in the box. 哪个改法是对的？","options":["some→any","aren't→isn't","box→boxes","There→Here"],"answer":0,"explanation_cn":"否定句里 some 要改成 any；apples 是复数，aren't 本身没错。"},{"id":"w6-fri-gr3","type":"choice","question":"改错：Could you give me any food? 哪个改法是对的？","options":["any→some","food→foods","give→gives","me→my"],"answer":0,"explanation_cn":"Could you…? 是委婉请求，希望对方答应，要用 some。"},{"id":"w6-fri-gr4","type":"choice","question":"改错：Both of them likes playing basketball. 哪个改法是对的？","options":["likes→like","them→they","playing→play","Both→All"],"answer":0,"explanation_cn":"both of them 是复数，动词不加 s：like。"},{"id":"w6-fri-gr5","type":"choice","question":"改错：All of us is keen on jazz. 哪个改法是对的？","options":["is→are","us→we","on→in","keen→keenly"],"answer":0,"explanation_cn":"all of us（我们所有人）是复数 → are。"}]},{"id":"w6-fri-choice2","name_cn":"a few / a little · some / any","type":"multiple_choice","duration":5,"questions":[{"id":"w6-fri-mcq1","type":"choice","question":"___ sugar would you like in your milk?","options":["How much","How many","A few","Many"],"answer":0,"explanation_cn":"sugar 糖，不可数 → How much。"},{"id":"w6-fri-mcq2","type":"choice","question":"There are still ___ carrots in the fridge. We can make soup with them.","options":["a few","a little","much","any"],"answer":0,"explanation_cn":"carrots 可数复数 → a few；a little 只修饰不可数。"},{"id":"w6-fri-mcq3","type":"choice","question":"Is there ___ butter left for the cake?","options":["any","a","an","many"],"answer":0,"explanation_cn":"butter 黄油不可数，不能用 a；一般疑问句用 any。"}]},{"id":"w6-fri-listening","name_cn":"听力：听对话 + 选图 + 听写","type":"listening","duration":5,"questions":[{"id":"w6-fri-ls1","type":"choice","question":"Listen to the dialogue. Why do people eat zongzi?","audio_text":"Girl: Dad, why do we eat zongzi at the Dragon Boat Festival? Dad: Because we want to remember the poet Qu Yuan. Girl: And what are those long boats for? Dad: They are for the dragon boat races.","options":["To remember Qu Yuan","To welcome spring","To thank the farmers","To celebrate a birthday"],"answer":0,"explanation_cn":"爸爸说 Because we want to remember the poet Qu Yuan（为了纪念诗人屈原）。后半段说的是龙舟，不是粽子的用意。"},{"id":"w6-fri-ls2","type":"choice","question":"Listen to the dialogue. When did Grandma learn to make zongzi?","audio_text":"Boy: Can you make zongzi, Grandma? Grandma: Yes, I learned it from my mother when I was ten. Boy: It looks difficult. Grandma: It is easy once you try.","options":["When she was ten","Last year","When she was twenty","This morning"],"answer":0,"explanation_cn":"奶奶说 I learned it from my mother when I was ten（十岁时跟妈妈学的）。"},{"id":"w6-fri-ls3","type":"choice","question":"Which picture matches the sentence you hear?","audio_text":"We watched the dragon boat race on the river yesterday.","options":["🛶","🚗","✈️","🚲"],"picture_options":true,"answer":0,"explanation_cn":"句子里说的是 dragon boat race（龙舟比赛），船在河上，所以选 🛶。"},{"id":"w6-fri-ls4","type":"fill","question":"Listen and fill in the blank: Every year we cook more zongzi than we need and share them with our ___.","audio_text":"Every year we cook more zongzi than we need and share them with our friends.","answer":"friends","explanation_cn":"听到的是 share them with our friends（和朋友们分享），friends 是复数。"}]},{"id":"w6-fri-ket_pet","name_cn":"KET/PET题型","type":"ket_pet","duration":10,"questions":[{"id":"w6-fri-kp1","type":"choice","question":"KET: I'd like ___ ticket to Beijing, please.","options":["a","an","the","some"],"answer":0,"explanation_cn":"ticket 是可数名词单数，泛指「一张」用 a。"},{"id":"w6-fri-kp2","type":"choice","question":"KET: ___ is the ticket? — Twenty yuan.","options":["How much","How many","How long","How often"],"answer":0,"explanation_cn":"问价格用 How much；How many 问可数数量。"},{"id":"w6-fri-kp3","type":"choice","question":"PET: This is the station ___ we met last year.","options":["where","which","when","whose"],"answer":0,"explanation_cn":"先行词是地点 station，从句 we met 不缺宾语，缺地点状语，用 where。"},{"id":"w6-fri-kp4","type":"choice","question":"PET: The train was so crowded that we ___ stand all the way.","options":["had to","must","should","can"],"answer":0,"explanation_cn":"so...that 从句描述过去的情况，用 had to（不得不）表示过去的必须。"},{"id":"w6-fri-kp5","type":"choice","question":"PET: She asked me ___ I had finished the project.","options":["whether","that","what","which"],"answer":0,"explanation_cn":"宾语从句原本是一般疑问句，转述时用 whether/if 引导。"}]},{"id":"w6-fri-kb","name_cn":"写作关键词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w6-fri-kb1","type":"fill","question":"粽子：d________ [填完整单词]","answer":"dumpling","explanation_cn":"dumpling 中间是 mpl，读 /ˈdʌmplɪŋ/；rice dumpling 就是粽子。"},{"id":"w6-fri-kb2","type":"fill","question":"节日：f_______ [填完整单词]","answer":"festival","explanation_cn":"festival 重音在第一个音节，读 /ˈfestɪvl/。"},{"id":"w6-fri-kb3","type":"fill","question":"比赛：r___ [填完整单词]","answer":"race","explanation_cn":"race 读 /reɪs/，dragon boat race 就是龙舟比赛。"},{"id":"w6-fri-kb4","type":"fill","question":"分享：s____ [填完整单词]","answer":"share","explanation_cn":"share sth. with sb. 和某人分享某物，读 /ʃeə/。"}]}]},{"day_cn":"周六","day_en":"Saturday","is_speaking_day":true,"total_duration":67,"theme_cn":"作文跟读 + AI口语 + 高频词汇 + 阅读理解 + 键盘拼写","modules":[{"id":"w6-sat-wd","name_cn":"作文跟读 · 背诵","type":"writing_drill","duration":6,"title":"中段抽读（邀请 · 锻炼 · 回复）","focus_cn":"Would you like to come with me? 要说到不用看提示","full_text":"Would you like to come with me? It would be great to do some exercise at the weekend. Let me know your idea.","cn_list":["你愿意和我一起来吗？","周末做些锻炼真是太好了。","告诉我你的想法吧。"],"full_text_cn":"你愿意和我一起来吗？周末做些锻炼真是太好了。告诉我你的想法吧。","pass_score":60},{"id":"w6-sat-speaking","name_cn":"AI口语练习","type":"speaking","duration":30,"questions":[{"id":"w6-sat-sp1","type":"choice","sentence":"Would you like to travel to space? Why or why not?","sentence_cn":"你想去太空旅行吗？为什么想，或者为什么不想？","options":["Yes, I would love to, because I want to see the Earth from above.","Space is very far away from us.","I watched a film about space last night.","There are many stars in the sky."],"answer":0,"pronunciation_tips":"would /wʊd/ 注意不要读成 will，from above 连读 /frəməˈbʌv/","explanation_cn":"Would you like to...? 的答句先用 Yes/No 表态，再给理由。A 表态 + 理由齐全。B、C、D 都没有表态。","explanation_en":"Answer 'Would you like to...?' with Yes or No first, then a reason. A does both; B, C and D never say whether they want to go.","answer_cn_hint":"先回答 Yes I would 或 No I wouldn't，再用 because 说理由。","options_cn":["想，我很愿意，因为我想从上面看看地球。","太空离我们非常远。","我昨晚看了一部关于太空的电影。","天空中有很多星星。"]},{"id":"w6-sat-sp2","type":"choice","sentence":"What do you usually do after dinner?","sentence_cn":"晚饭后你通常做什么？","options":["I usually take a walk with my dog and then read for a while.","I had dinner at half past six.","Dinner is the biggest meal of the day.","My mother cooks very well."],"answer":0,"pronunciation_tips":"usually /ˈjuːʒuəli/，take a walk 连读自然，for a while 意为「一会儿」","explanation_cn":"问「通常做什么」，要用一般现在时 + usually。A 说了两个习惯动作。B 说昨天几点吃饭；C 是常识；D 说的是妈妈。","explanation_en":"The question asks about a habit, so use the simple present with 'usually'. A lists two habits; B talks about one evening, C is a general fact and D describes the mother.","answer_cn_hint":"答句要说出习惯做的事，动词用原形，可以加 usually、often。","options_cn":["我通常和狗一起散散步，然后看一会儿书。","我六点半吃的晚饭。","晚饭是一天中最大的一餐。","我妈妈做饭很好吃。"]},{"id":"w6-sat-sp3","type":"choice","sentence":"How do you keep healthy in winter?","sentence_cn":"冬天你怎么保持健康？","options":["I drink warm water, wear thick clothes and go to bed early.","Winter is colder than autumn.","I was ill last winter for a week.","Many people like snow."],"answer":0,"pronunciation_tips":"thick /θɪk/ 舌尖轻触上齿，healthy /ˈhelθi/ 注意 th 音","explanation_cn":"问「怎么保持健康」，要给出具体做法。A 给了三条：喝温水、穿厚衣、早睡。B 讲天气；C 说生病；D 说别人喜欢雪。","explanation_en":"The question asks for ways to stay healthy, so list concrete habits. A gives three; B describes the weather, C mentions being ill and D talks about other people.","answer_cn_hint":"用一般现在时说出两三个做法，比如 drink warm water、wear thick clothes。","options_cn":["我喝温水、穿厚衣服，还很早睡觉。","冬天比秋天冷。","去年冬天我病了一个星期。","很多人喜欢雪。"]},{"id":"w6-sat-sp4","type":"choice","sentence":"What is the best way for you to learn new words?","sentence_cn":"对你来说，学新单词最好的方法是什么？","options":["The best way for me is to use them in a sentence of my own.","There are many words in English.","I learned twenty words last week.","My dictionary is very heavy."],"answer":0,"pronunciation_tips":"sentence /ˈsentəns/ 重音在前，of my own 连读","explanation_cn":"问「最好的方法」，答句要用 The best way is to... 给出方法。A 正确（自己造句）。B、C、D 都没给方法。","explanation_en":"The question asks for the best method, so answer with 'The best way is to...'. A gives a method; the others give facts instead.","answer_cn_hint":"用 The best way for me is to + 动词原形，说一个具体做法。","options_cn":["对我来说最好的方法是用它们造一个自己的句子。","英语里有很多单词。","我上周学了二十个单词。","我的词典很重。"]},{"id":"w6-sat-sp5","type":"choice","sentence":"Who do you admire most, and why?","sentence_cn":"你最敬佩谁？为什么？","options":["I admire my grandfather, because he taught himself English at sixty.","There are five people in my family.","My teacher gave us a lot of homework.","I met him at the school gate."],"answer":0,"pronunciation_tips":"admire /ədˈmaɪə/ 重音在第二音节，himself 注意重读 self","explanation_cn":"要求介绍一个敬佩的人，要说出是谁 + 为什么。A 说了 grandfather 和原因。B 说家里人数；C 说作业；D 说见面地点。","explanation_en":"Name the person and explain why you admire them. A gives both; B, C and D do not describe anyone you admire.","answer_cn_hint":"先说是谁，再用 because 说一件他做过的事，这样最有说服力。","options_cn":["我敬佩我爷爷，因为他六十岁自学了英语。","我家有五口人。","老师给我们布置了很多作业。","我在校门口遇见了他。"]}]},{"id":"w6-sat-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"astronaut","phonetic":"/ˈæstrənɔːt/","meaning":"宇航员","emoji":"👨‍🚀","example_en":"The astronaut waved to us from the window.","example_cn":"宇航员从窗口向我们挥手。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🌀","🎯","👨‍🚀","📡"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🔬","📡","👨‍🚀","🌀"],"answer":2},{"type":"meaning_choice","prompt":"astronaut 是什么意思？（1/2）","options":["失重的","实验室","宇航员","信号"],"answer":2},{"type":"meaning_choice","prompt":"astronaut 是什么意思？（2/2）","options":["失重的","任务","信号","宇航员"],"answer":3},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: ast__naut","answer":"ro"}],"letters":["a","s","t","r","o","n","a","u","t"],"syllables":["as","tro","naut"],"hint_cn":"坐火箭上天工作的人"},{"word":"weightless","phonetic":"/ˈweɪtləs/","meaning":"失重的","emoji":"🌀","example_en":"Water floats in the air because it is weightless there.","example_cn":"水在空中飘着，因为那里是失重的。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🎯","📡","🌀","👨‍🚀"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🌀","📡","🎯","🔬"],"answer":0},{"type":"meaning_choice","prompt":"weightless 是什么意思？（1/2）","options":["任务","信号","失重的","实验室"],"answer":2},{"type":"meaning_choice","prompt":"weightless 是什么意思？（2/2）","options":["失重的","实验室","信号","宇航员"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: weig__less","answer":"ht"}],"letters":["w","e","i","g","h","t","l","e","s","s"],"syllables":["weight","less"],"hint_cn":"在太空里身体轻飘飘的"},{"word":"mission","phonetic":"/ˈmɪʃn/","meaning":"任务","emoji":"🎯","example_en":"The team finished the six-month mission in space.","example_cn":"这支队伍完成了为期六个月的太空任务。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["👨‍🚀","📡","🎯","🌀"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🎯","🌀","📡","🔬"],"answer":0},{"type":"meaning_choice","prompt":"mission 是什么意思？（1/2）","options":["任务","失重的","信号","实验室"],"answer":0},{"type":"meaning_choice","prompt":"mission 是什么意思？（2/2）","options":["宇航员","任务","实验室","失重的"],"answer":1},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: mi__ion","answer":"ss"}],"letters":["m","i","s","s","i","o","n"],"syllables":["mis","sion"],"hint_cn":"上头交给你必须完成的一件事"},{"word":"signal","phonetic":"/ˈsɪɡnəl/","meaning":"信号","emoji":"📡","example_en":"The phone signal is weak in the mountains.","example_cn":"山里手机信号很弱。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["📡","🌀","🎯","🔬"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🌀","📡","🔬","🎯"],"answer":1},{"type":"meaning_choice","prompt":"signal 是什么意思？（1/2）","options":["任务","信号","实验室","宇航员"],"answer":1},{"type":"meaning_choice","prompt":"signal 是什么意思？（2/2）","options":["失重的","信号","宇航员","实验室"],"answer":1},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: si__al","answer":"gn"}],"letters":["s","i","g","n","a","l"],"syllables":["sig","nal"],"hint_cn":"手机格数变少时说的那个词"},{"word":"laboratory","phonetic":"/ləˈbɒrətri/","meaning":"实验室","emoji":"🔬","example_en":"We did the water test in the school laboratory.","example_cn":"我们在学校实验室做了水质测试。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["📡","🔬","👨‍🚀","🌀"],"answer":1},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["📡","🎯","🔬","👨‍🚀"],"answer":2},{"type":"meaning_choice","prompt":"laboratory 是什么意思？（1/2）","options":["失重的","实验室","任务","宇航员"],"answer":1},{"type":"meaning_choice","prompt":"laboratory 是什么意思？（2/2）","options":["任务","宇航员","实验室","信号"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: labo__tory","answer":"ra"}],"letters":["l","a","b","o","r","a","t","o","r","y"],"syllables":["la","bor","a","to","ry"],"hint_cn":"做科学实验的房间"}]},{"id":"w6-sat-mc","name_cn":"代词","type":"multiple_choice","duration":5,"questions":[{"id":"w6-sat-mc1","type":"choice","question":"—Which one would you like, coffee or orange juice? —___. I just want something to eat.","options":["Coffee","Both","Orange juice","Neither"],"answer":3,"explanation_cn":"咖啡和橙汁两个都不要 → Neither（两者都不）；Both 是两个都要。"},{"id":"w6-sat-mc2","type":"choice","question":"This is my brother. ___ name is Tom.","options":["His","He","Him","Its"],"answer":0,"explanation_cn":"修饰名词 name 要用形容词性物主代词 His；he 是主格、him 是宾格。"},{"id":"w6-sat-mc3","type":"choice","question":"My best friend is Alice. ___ is a dancer.","options":["She","Her","Hers","It"],"answer":0,"explanation_cn":"作主语用主格 She；her 是宾格，hers 是名词性物主代词。"},{"id":"w6-sat-mc4","type":"choice","question":"The pencil is ___. Tom left it here yesterday.","options":["his","him","he","it"],"answer":0,"explanation_cn":"\"是他的\"后面不再跟名词 → 名词性物主代词 his。"},{"id":"w6-sat-mc5","type":"choice","question":"___ father is a pilot. I admire him very much.","options":["My","He","Him","I"],"answer":0,"explanation_cn":"修饰名词 father 用形容词性物主代词 My（我的）。"}]},{"id":"w6-sat-grammar","name_cn":"some / any（2）","type":"grammar","duration":10,"questions":[{"id":"w6-sat-gr1","type":"fill","question":"Are there ___ books on the table?","answer":"some","explanation_cn":"一般疑问句多用 any，但说话人盼着回答\"有\"、或是在提议时，问句也用 some。"},{"id":"w6-sat-gr2","type":"fill","question":"You can take ___ photos in the park.","answer":"some","explanation_cn":"向对方提议、提供东西时用 some。"},{"id":"w6-sat-gr3","type":"fill","question":"Can I ask you ___ questions?","answer":"some","explanation_cn":"Can I…? 是向别人提请求，希望对方说\"好\"，用 some 不用 any。"},{"id":"w6-sat-gr4","type":"fill","question":"There are ___ interesting places in this city.","answer":"some","explanation_cn":"肯定陈述句用 some；places 可数复数，be 动词用 are。"}]},{"id":"w6-sat-choice2","name_cn":"词组填空","type":"multiple_choice","duration":5,"questions":[{"id":"w6-sat-mcq1","type":"fill","question":"词组补充——有能力做某事：be ___ to do sth","answer":"able","explanation_cn":"be able to do sth 有能力做某事。"},{"id":"w6-sat-mcq2","type":"fill","question":"词组补充——害怕：be ___ of","answer":"afraid","explanation_cn":"be afraid of 害怕……。"},{"id":"w6-sat-mcq3","type":"fill","question":"词组补充——同意：___ with","answer":"agree","explanation_cn":"agree with sb 同意某人（的意见）。"},{"id":"w6-sat-mcq4","type":"fill","question":"词组补充——很久以前：a long time ___","answer":"ago","explanation_cn":"a long time ago 很久以前。"}]},{"id":"w6-sat-kb","name_cn":"今天学的词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w6-sat-kb1","type":"fill","question":"宇航员：a________ [填完整单词]","answer":"astronaut","explanation_cn":"astro 表示「星星」，naut 表示「航行的人」，读 /ˈæstrənɔːt/。"},{"id":"w6-sat-kb2","type":"fill","question":"失重的：w_________ [填完整单词]","answer":"weightless","explanation_cn":"weight（重量）+ less（没有）= 失重的，读 /ˈweɪtləs/。"},{"id":"w6-sat-kb3","type":"fill","question":"任务：m______ [填完整单词]","answer":"mission","explanation_cn":"mission 结尾是 sion，读 /ʃn/，注意两个 s。"},{"id":"w6-sat-kb4","type":"fill","question":"信号：s______ [填完整单词]","answer":"signal","explanation_cn":"signal 中间是 gn，g 不发音，读 /ˈsɪɡnəl/。"}]}]},{"day_cn":"周日","day_en":"Sunday","is_speaking_day":false,"total_duration":27,"theme_cn":"作文跟读 + 高频词汇 + 完形填空 + 键盘拼写","modules":[{"id":"w6-sun-wd","name_cn":"作文跟读 · 背诵","type":"writing_drill","duration":6,"title":"最长的两句（集合地点 · 交通）","focus_cn":"这两句最长，读顺了整封信就都顺了；试着不看文字说出来","full_text":"The swimming pool is at the stadium downtown, and we can meet at the entrance. I will go there by bike because the weather will be good on Saturday.","cn_list":["游泳池在市中心的体育馆里，我们可以在入口处碰面。","我打算骑自行车去，因为周六天气会很好。"],"full_text_cn":"游泳池在市中心的体育馆里，我们可以在入口处碰面。我打算骑自行车去，因为周六天气会很好。","pass_score":60},{"id":"w6-sun-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"payment","phonetic":"/ˈpeɪmənt/","meaning":"付款","emoji":"💳","example_en":"The payment went through in a second.","example_cn":"付款一秒钟就完成了。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🔢","👛","💳","👍"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["👛","🔢","💳","📷"],"answer":2},{"type":"meaning_choice","prompt":"payment 是什么意思？（1/2）","options":["方便的","钱包","数字的","付款"],"answer":3},{"type":"meaning_choice","prompt":"payment 是什么意思？（2/2）","options":["付款","方便的","数字的","钱包"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: pa__ent","answer":"ym"}],"letters":["p","a","y","m","e","n","t"],"syllables":["pay","ment"],"hint_cn":"买东西把钱给出去这一步"},{"word":"wallet","phonetic":"/ˈwɒlɪt/","meaning":"钱包","emoji":"👛","example_en":"He took a photo of his card and put it in his wallet.","example_cn":"他给卡拍了照，然后放进钱包。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["👛","🔢","👍","📷"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["📷","💳","👛","🔢"],"answer":2},{"type":"meaning_choice","prompt":"wallet 是什么意思？（1/2）","options":["扫描","付款","数字的","钱包"],"answer":3},{"type":"meaning_choice","prompt":"wallet 是什么意思？（2/2）","options":["钱包","方便的","付款","数字的"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: wa__et","answer":"ll"}],"letters":["w","a","l","l","e","t"],"syllables":["wal","let"],"hint_cn":"装钱和卡的小包"},{"word":"scan","phonetic":"/skæn/","meaning":"扫描","emoji":"📷","example_en":"Please scan this code before you pay.","example_cn":"付款前请扫一下这个码。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🔢","👛","👍","📷"],"answer":3},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🔢","👛","👍","📷"],"answer":3},{"type":"meaning_choice","prompt":"scan 是什么意思？（1/2）","options":["方便的","付款","扫描","数字的"],"answer":2},{"type":"meaning_choice","prompt":"scan 是什么意思？（2/2）","options":["扫描","付款","钱包","方便的"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: s__n","answer":"ca"}],"letters":["s","c","a","n"],"syllables":["scan"],"hint_cn":"用镜头对着码照一下"},{"word":"digital","phonetic":"/ˈdɪdʒɪtl/","meaning":"数字的","emoji":"🔢","example_en":"Most students now read digital books on a tablet.","example_cn":"现在大多数学生在平板上读电子书。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🔢","💳","👛","👍"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🔢","👍","💳","📷"],"answer":0},{"type":"meaning_choice","prompt":"digital 是什么意思？（1/2）","options":["扫描","付款","数字的","方便的"],"answer":2},{"type":"meaning_choice","prompt":"digital 是什么意思？（2/2）","options":["付款","方便的","数字的","扫描"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: di__tal","answer":"gi"}],"letters":["d","i","g","i","t","a","l"],"syllables":["di","gi","tal"],"hint_cn":"跟电脑、网络有关的那种"},{"word":"convenient","phonetic":"/kənˈviːniənt/","meaning":"方便的","emoji":"👍","example_en":"Paying by phone is convenient for busy people.","example_cn":"用手机付款对忙碌的人来说很方便。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["👍","👛","📷","💳"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["👛","📷","👍","💳"],"answer":2},{"type":"meaning_choice","prompt":"convenient 是什么意思？（1/2）","options":["数字的","钱包","方便的","扫描"],"answer":2},{"type":"meaning_choice","prompt":"convenient 是什么意思？（2/2）","options":["钱包","付款","数字的","方便的"],"answer":3},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: conv__ient","answer":"en"}],"letters":["c","o","n","v","e","n","i","e","n","t"],"syllables":["con","ve","nient"],"hint_cn":"省事、不麻烦"}]},{"id":"w6-sun-cloze","name_cn":"完形填空","type":"cloze","duration":10,"passage":"Last Saturday I went to the community library as a 1___. The librarian, Ms Chen, showed me around and gave me a simple job. My work was to put the returned books back in the right 2___, and at first I made a few mistakes, but she told me to read the 3___ on each cover carefully. By noon I had finished two shelves. A little girl asked me for a story about 4___, so I found one with lovely pictures of pandas. In the afternoon we read aloud to 5___ children who came with their parents. When I left, Ms Chen smiled and said I had done a good 6___.","questions":[{"id":"w6-sun-cz1","type":"choice","question":"1___","options":["volunteer","visitor","driver","painter"],"answer":0,"explanation_cn":"去社区图书馆帮忙做事的人是志愿者 volunteer。visitor 只表示参观者。"},{"id":"w6-sun-cz2","type":"choice","question":"2___","options":["order","price","cover","shelf"],"answer":0,"explanation_cn":"put the books back in the right order 按正确顺序放回书，与后文看标签对应。"},{"id":"w6-sun-cz3","type":"choice","question":"3___","options":["label","picture","story","colour"],"answer":0,"explanation_cn":"封面上贴的标签 label 写着编号，用来判断该放哪。"},{"id":"w6-sun-cz4","type":"choice","question":"4___","options":["animals","weather","sports","music"],"answer":0,"explanation_cn":"下文说 pictures of pandas（熊猫图片），所以是动物的故事。"},{"id":"w6-sun-cz5","type":"choice","question":"5___","options":["younger","taller","richer","quieter"],"answer":0,"explanation_cn":"跟父母一起来的、需要别人读故事的孩子，是更小的孩子 younger children。"},{"id":"w6-sun-cz6","type":"choice","question":"6___","options":["job","meal","game","trip"],"answer":0,"explanation_cn":"do a good job 干得好，是固定搭配。"}]},{"id":"w6-sun-kb","name_cn":"今天学的词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w6-sun-kb1","type":"fill","question":"付款：p______ [填完整单词]","answer":"payment","explanation_cn":"pay + ment 变名词，payment 读 /ˈpeɪmənt/。"},{"id":"w6-sun-kb2","type":"fill","question":"钱包：w_____ [填完整单词]","answer":"wallet","explanation_cn":"wallet 读 /ˈwɒlɪt/，注意两个 l 和一个 t。"},{"id":"w6-sun-kb3","type":"fill","question":"扫描：s____ [填完整单词]","answer":"scan","explanation_cn":"scan 是重读闭音节，双写 n 再加 ing：scanning。"}]}]}];
const WEEK7 = [{"day_cn":"周一","day_en":"Monday","is_speaking_day":true,"total_duration":57,"theme_cn":"作文跟读 + AI口语 + Exercise02词汇 + 阅读理解 + 键盘拼写","modules":[{"id":"w7-mon-wd","name_cn":"作文跟读 · 背诵","type":"writing_drill","duration":6,"title":"第 1~2 句 · 开头与邀约","focus_cn":"先把 Dear Lucy 称呼和第一句读顺，再接 We can meet at your home.","full_text":"Dear Lucy, I am so happy to go shopping with you tomorrow. We can meet at your home.","cn_list":["亲爱的Lucy，明天能和你一起去购物我太开心了。","我们可以在你家碰面。"],"blank_list":["shopping","at"],"blank_cn_list":["购物","小地点前用的介词「在」"],"full_text_cn":"亲爱的Lucy，明天能和你一起去购物我太开心了。我们可以在你家碰面。","pass_score":60},{"id":"w7-mon-speaking","name_cn":"AI口语练习","type":"speaking","duration":30,"questions":[{"id":"w7-mon-sp1","type":"choice","sentence":"Have you ever travelled on a boat along a river or a lake?","sentence_cn":"你坐过船在河上或湖上游玩吗？","options":["Yes, I took a boat on the West Lake last summer, and the water was very clear.","The West Lake is a lake in Hangzhou.","Most small boats are made of wood.","I will go to the lake with my cousin tomorrow."],"answer":0,"pronunciation_tips":"travelled /ˈtrævld/ 词尾 d 很轻，along 读 /əˈlɒŋ/，clear 里的 /ɪə/ 要滑动","explanation_cn":"问的是「你坐过吗 + 什么感觉」，答句要表态再说经历。A 有 Yes、时间地点和感受；B、C 是常识介绍；D 说的是明天的计划，都没回答「坐过没有」。","answer_cn_hint":"先用 Yes 或 No 表态，再说什么时候、在哪里坐的船，最后补一句感受。","options_cn":["坐过，去年夏天我在西湖坐了船，水非常清。","西湖是杭州的一个湖。","大多数小船是用木头做的。","明天我要和表哥去湖边。"]},{"id":"w7-mon-sp2","type":"choice","sentence":"Why do people build canals?","sentence_cn":"人们为什么要修运河？","options":["People build canals so that boats can carry heavy things between cities.","Canals are usually full of water all year round.","Some canals in China are more than one thousand years old.","I like watching boats go slowly along the canal."],"answer":0,"pronunciation_tips":"canal /kəˈnæl/ 重音在第二音节，so that 连读 /səʊðət/，heavy /ˈhevi/ 注意 v 的唇齿音","explanation_cn":"Why 问原因，答句要用 because 或 so that 说出目的。A 说出了运货这个目的；B、C 是描述事实；D 说的是自己的喜好，都没有回答「为什么」。","answer_cn_hint":"用 …so that… 或 because 讲出目的，比如运货物、送粮食。","options_cn":["人们修运河是为了让船在城市之间运送很重的东西。","运河通常一年到头都装满了水。","中国有些运河已经有一千多年历史了。","我喜欢看船沿着运河慢慢开。"]},{"id":"w7-mon-sp3","type":"choice","sentence":"Which do you like better, travelling by train or by boat?","sentence_cn":"你更喜欢哪个：坐火车旅行还是坐船旅行？","options":["I like travelling by train better, because it is fast and I can read on the way.","Trains and boats are both very old inventions.","I went to Shanghai by train with my aunt last year.","My uncle works on a big boat near the sea."],"answer":0,"pronunciation_tips":"travelling 英式双写 l，better 里的 tt 在美音里读成轻快的 /d/，because 重音在后","explanation_cn":"这是二选一的问题，要先选一个再给理由。A 选了火车并说明原因；B 只是比较年代；C 讲一次经历；D 说叔叔的工作，都没有做选择。","answer_cn_hint":"先说 I like … better，再用 because 说一条理由，两边都要说到。","options_cn":["我更喜欢坐火车旅行，因为它很快，我还能在路上看书。","火车和船都是很老的发明。","去年我和姑姑坐火车去了上海。","我叔叔在海边的一艘大船上工作。"]},{"id":"w7-mon-sp4","type":"choice","sentence":"If you could visit one place along the old canal, where would you go?","sentence_cn":"如果可以去运河沿线的某个地方，你会去哪里？","options":["I would go to Suzhou, because I want to see the old stone bridges there.","The canal is about 1,800 kilometres long.","Suzhou is a beautiful city in the south of China.","I went to Suzhou with my parents by car."],"answer":0,"pronunciation_tips":"would /wʊd/ 不要读成 will，Suzhou 读 /suːˈdʒəʊ/，bridges /ˈbrɪdʒɪz/ 词尾要出声","explanation_cn":"这是假设句，答句要用 I would go to… 说出地点，再给理由。A 两项都有；B、C 是客观介绍；D 说的是真实发生过的事，时态不对。","answer_cn_hint":"用 I would go to + 地名，再用 because 说想在那里看什么、做什么。","options_cn":["我会去苏州，因为我想看看那里古老的石桥。","这条运河大约有一千八百公里长。","苏州是中国南方一座美丽的城市。","我和爸爸妈妈开车去过苏州。"]},{"id":"w7-mon-sp5","type":"choice","sentence":"How can we keep the water in rivers and canals clean?","sentence_cn":"我们怎样让河流和运河里的水保持干净？","options":["We can stop throwing rubbish into the river and use fewer plastic bags.","Water is very important for every living thing.","The river near my home is wide and deep.","There are many fish in the river this year."],"answer":0,"pronunciation_tips":"rubbish /ˈrʌbɪʃ/ 注意 sh 音，plastic /ˈplæstɪk/ 重音在前，fewer 和 less 别混用","explanation_cn":"How 问方法，答句要给具体做法。A 给了两条（不丢垃圾、少用塑料袋）；B 是道理；C、D 是描述，都没有给出办法。","answer_cn_hint":"用 We can + 动词原形说出两三件具体的事，比如不丢垃圾、多种树。","options_cn":["我们可以不再往河里扔垃圾，还可以少用塑料袋。","水对每一种生物都非常重要。","我家附近的河又宽又深。","今年河里的鱼很多。"]}]},{"id":"w7-mon-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"bedroom","phonetic":"/ˈbedruːm/","meaning":"卧室","emoji":"🛏️","example_en":"There is a big bed in my bedroom.","example_cn":"我的卧室里有一张大床。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🧑‍💼","🛁","🏹","🛏️"],"answer":3},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["📰","🛏️","🧑‍💼","🛁"],"answer":1},{"type":"meaning_choice","prompt":"bedroom 是什么意思？（1/2）","options":["箭","文章","卧室","浴室"],"answer":2},{"type":"meaning_choice","prompt":"bedroom 是什么意思？（2/2）","options":["助手；店员","卧室","箭","文章"],"answer":1},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: be__oom","answer":"dr"}],"letters":["b","e","d","r","o","o","m"],"syllables":["bed","room"],"hint_cn":"bed 是床，睡觉用的那间房"},{"word":"bathroom","phonetic":"/ˈbɑːθruːm/","meaning":"浴室","emoji":"🛁","example_en":"He takes a shower in the bathroom every morning.","example_cn":"他每天早上在浴室里洗澡。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["📰","🛁","🏹","🧑‍💼"],"answer":1},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🛏️","📰","🧑‍💼","🛁"],"answer":3},{"type":"meaning_choice","prompt":"bathroom 是什么意思？（1/2）","options":["卧室","箭","浴室","文章"],"answer":2},{"type":"meaning_choice","prompt":"bathroom 是什么意思？（2/2）","options":["助手；店员","文章","浴室","卧室"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: bat__oom","answer":"hr"}],"letters":["b","a","t","h","r","o","o","m"],"syllables":["bath","room"],"hint_cn":"bath 是洗澡，洗澡用的那间房"},{"word":"assistant","phonetic":"/əˈsɪstənt/","meaning":"助手；店员","emoji":"🧑‍💼","example_en":"The shop assistant helped me find the right shoes.","example_cn":"店员帮我找到了合适的鞋子。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🏹","📰","🛏️","🧑‍💼"],"answer":3},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🏹","🧑‍💼","📰","🛁"],"answer":1},{"type":"meaning_choice","prompt":"assistant 是什么意思？（1/2）","options":["浴室","卧室","箭","助手；店员"],"answer":3},{"type":"meaning_choice","prompt":"assistant 是什么意思？（2/2）","options":["浴室","卧室","助手；店员","文章"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: ass__tant","answer":"is"}],"letters":["a","s","s","i","s","t","a","n","t"],"syllables":["as","sis","tant"],"hint_cn":"assist 是帮忙，店里帮你的那个人"},{"word":"article","phonetic":"/ˈɑːtɪkl/","meaning":"文章","emoji":"📰","example_en":"I read an article about pandas in the newspaper.","example_cn":"我在报纸上读了一篇关于熊猫的文章。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["📰","🛏️","🧑‍💼","🏹"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["📰","🧑‍💼","🏹","🛏️"],"answer":0},{"type":"meaning_choice","prompt":"article 是什么意思？（1/2）","options":["助手；店员","浴室","文章","卧室"],"answer":2},{"type":"meaning_choice","prompt":"article 是什么意思？（2/2）","options":["文章","卧室","助手；店员","浴室"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: ar__cle","answer":"ti"}],"letters":["a","r","t","i","c","l","e"],"syllables":["ar","ti","cle"],"hint_cn":"报纸或杂志上的一篇文字"},{"word":"arrow","phonetic":"/ˈærəʊ/","meaning":"箭","emoji":"🏹","example_en":"The hunter hit the target with one arrow.","example_cn":"他拉开弓，一击就命中了靶心。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🧑‍💼","🛏️","🏹","🛁"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🧑‍💼","📰","🛏️","🏹"],"answer":3},{"type":"meaning_choice","prompt":"arrow 是什么意思？（1/2）","options":["浴室","文章","箭","卧室"],"answer":2},{"type":"meaning_choice","prompt":"arrow 是什么意思？（2/2）","options":["文章","箭","助手；店员","卧室"],"answer":1},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: a__ow","answer":"rr"}],"letters":["a","r","r","o","w"],"syllables":["ar","row"],"hint_cn":"一头尖、能射出去的细棍"}]},{"id":"w7-mon-reading","name_cn":"阅读理解 · 京杭大运河","type":"reading","duration":10,"passage":"The Grand Canal of China is the longest man-made waterway in the world, and it runs from Beijing in the north to Hangzhou in the south. It is about 1,800 kilometres long, which is longer than many big rivers. People began to dig it more than 2,000 years ago, and the work took hundreds of years. In the old days, boats carried rice, silk and salt along the canal to the capital. Today the canal is still full of water, and visitors can take a boat trip to see the old stone bridges. Last spring my class went to the canal museum in Hangzhou and learned how the water gates work.","passage_cn":"中国的京杭大运河是世界上最长的运河，它从北方的北京一直通到南方的杭州。它大约有一千八百公里长，比很多大河都长。人们在两千多年前就开始挖这条河，前后花了几百年的时间。古时候，船沿着运河把大米、丝绸和盐运到京城。今天运河里仍然满是水，游客可以坐船去看那些古老的石桥。去年春天我们班去了杭州的运河博物馆，学到了船闸是怎样工作的。","questions":[{"id":"w7-mon-rd1","type":"choice","question":"How long is the Grand Canal?","options":["About 1,800 kilometres","About 800 kilometres","About 18,000 kilometres","About 180 kilometres"],"answer":0,"explanation_cn":"第二句直接说 It is about 1,800 kilometres long（大约一千八百公里）。"},{"id":"w7-mon-rd2","type":"choice","question":"What did boats carry along the canal in the old days?","options":["Rice, silk and salt","Coal and wood","Cars and bikes","Books and chairs"],"answer":0,"explanation_cn":"第四句写 boats carried rice, silk and salt（大米、丝绸和盐），其他三项文中没提。"},{"id":"w7-mon-rd3","type":"choice","question":"Where did the writer's class go last spring?","options":["To the canal museum in Hangzhou","To the Great Wall in Beijing","To a science museum","To the seaside"],"answer":0,"explanation_cn":"最后一句说 my class went to the canal museum in Hangzhou（去了杭州的运河博物馆）。"}]},{"id":"w7-mon-kb","name_cn":"今天学的词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w7-mon-kb1","type":"fill","question":"卧室：b_______ [填完整单词]","answer":"bedroom","explanation_cn":"bedroom = bed（床）+ room（房间），睡觉的房间。"},{"id":"w7-mon-kb2","type":"fill","question":"文章：a______ [填完整单词]","answer":"article","explanation_cn":"article 读 /ˈɑːtɪkl/，重音在最前面，结尾是 cle。"},{"id":"w7-mon-kb3","type":"fill","question":"箭；箭头：a____ [填完整单词]","answer":"arrow","explanation_cn":"arrow 读 /ˈærəʊ/，开头 ar-，结尾 -row，和「行/排」的 row 同音。"}]}]},{"day_cn":"周二","day_en":"Tuesday","is_speaking_day":false,"total_duration":37,"theme_cn":"作文跟读 + 阅读理解 + 代词语法 + 听力 + 键盘拼写","modules":[{"id":"w7-tue-wd","name_cn":"作文跟读 · 背诵","type":"writing_drill","duration":6,"title":"第 3~5 句 · 时间与交通","focus_cn":"Is 10 o'clock OK? 注意语调上扬；take a taxi 是打车","full_text":"Is 10 o'clock OK? Then we can take a taxi. I want to buy new football boots and some pairs of socks.","cn_list":["10点钟行吗？","然后我们可以打出租车去。","我想买新足球鞋和几双袜子。"],"blank_list":["is","taxi","boots"],"blank_cn_list":["问句开头的「是」（敲小写就行）","出租车","球场上穿的靴子"],"full_text_cn":"10点钟行吗？然后我们可以打出租车去。我想买新足球鞋和几双袜子。","pass_score":60},{"id":"w7-tue-reading","name_cn":"阅读理解 · 皮影戏","type":"reading","duration":10,"passage":"Shadow puppetry is an old Chinese art that is more than 2,000 years old. The puppets are made of thin leather, and workers cut and colour them by hand. Behind a white cloth screen, a lamp shines and makes the puppets' shadows dance. The puppeteer pulls small sticks and sings the story at the same time. One person can move three or four puppets and speak for all of them. In 2011 this art became a world treasure, and now some primary schools teach it in art classes.","passage_cn":"皮影戏是一门古老的中国艺术，已经有两千多年历史。皮影是用薄薄的皮革做的，工人用手工剪刻并上色。在一块白布后面，一盏灯照着，让皮影的影子跳起舞来。演皮影的人一边拉动小棍子，一边唱故事。一个人能同时操纵三四个皮影，还能替它们说话。二零一一年这门艺术成为世界级的宝贝，现在一些小学在美术课上教它。","questions":[{"id":"w7-tue-rd1","type":"choice","question":"What are the puppets made of?","options":["Thin leather","Thin paper","White cloth","Bamboo"],"answer":0,"explanation_cn":"第二句说 The puppets are made of thin leather（用薄皮革做的），白布只是幕布（screen）。"},{"id":"w7-tue-rd2","type":"choice","question":"What makes the shadows dance on the screen?","options":["A lamp behind the screen","The sun in the morning","A mirror on the wall","A computer program"],"answer":0,"explanation_cn":"第三句说 Behind a white cloth screen, a lamp shines（幕布后面有一盏灯照着），才有影子。"},{"id":"w7-tue-rd3","type":"choice","question":"How many puppets can one puppeteer move at the same time?","options":["Three or four","Only one","Ten or twelve","Two hundred"],"answer":0,"explanation_cn":"第五句写 One person can move three or four puppets（一个人能操纵三四个皮影）。"}]},{"id":"w7-tue-grammar","name_cn":"一般过去时（1）","type":"grammar","duration":10,"questions":[{"id":"w7-tue-gr1","type":"fill","question":"用括号里代词的适当形式填空：This is ___ (I) mother.","answer":"my","explanation_cn":"I 是主格「我」，这里要说「我的」妈妈，用形容词性物主代词 my。"},{"id":"w7-tue-gr2","type":"fill","question":"用括号里代词的适当形式填空：Look at these flowers. ___ (them) are beautiful.","answer":"they","explanation_cn":"空里缺的是主语，要用主格；them 是宾格，主格是 they，句首在屏幕上会自动大写，答案敲小写 they 就行。"},{"id":"w7-tue-gr3","type":"fill","question":"用括号里代词的适当形式填空：Please pass ___ (he) a book to read.","answer":"him","explanation_cn":"动词 pass 后面的人要用宾格，he 的宾格是 him：pass him a book 递给他一本书。"},{"id":"w7-tue-gr4","type":"fill","question":"用括号里代词的适当形式填空：This cat is not ___ (me); it is Lucy's.","answer":"mine","explanation_cn":"后面没有名词，要单独用名词性物主代词 mine = my cat。me 是宾格，不能当「我的」用。"},{"id":"w7-tue-gr5","type":"fill","question":"用括号里代词的适当形式填空：You cannot leave him alone; he is too young to stay with ___ (he).","answer":"himself","explanation_cn":"他自己陪他自己 → 反身代词 himself。主语是 he，反身代词用 himself。"},{"id":"w7-tue-gr6","type":"fill","question":"用括号里代词的适当形式填空：Miss White is my English teacher; I am ___ (she) student.","answer":"her","explanation_cn":"「她的学生」，名词前面用形容词性物主代词 her。"}]},{"id":"w7-tue-listening","name_cn":"听力练习","type":"listening","duration":5,"questions":[{"id":"w7-tue-ls1","type":"choice","question":"Listen to the dialogue. When does the puppet show start?","audio_text":"Girl: Dad, when does the shadow puppet show start? Dad: It starts at half past seven, so we should leave home at six. Girl: Great, I will finish my homework first.","options":["At half past seven","At six o'clock","At eight o'clock","At half past six"],"answer":0,"explanation_cn":"爸爸说 It starts at half past seven（七点半开始）；六点是出门的时间，别混。"},{"id":"w7-tue-ls2","type":"choice","question":"Which picture matches the sentence you hear?","audio_text":"The old man is pulling a small stick behind the white screen.","options":["🎭","🥁","🎻","🪕"],"picture_options":true,"answer":0,"explanation_cn":"句子里说的是 white screen（白幕）和老人在幕后拉小棍，是皮影戏，所以选 🎭。"},{"id":"w7-tue-ls3","type":"fill","question":"Listen and fill in the blank: The puppets are made of thin ___.","audio_text":"The puppets are made of thin leather, and they are cut by hand.","answer":"leather","explanation_cn":"听到 The puppets are made of thin leather（薄皮革），所以填 leather。"}]},{"id":"w7-tue-kb","name_cn":"阅读里的重点词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w7-tue-kb1","type":"fill","question":"购物：s_______ [填完整单词]","answer":"shopping","explanation_cn":"shopping 双写 p 再加 ing：shop → shopping，本周作文第一句就是它。"},{"id":"w7-tue-kb2","type":"fill","question":"出租车：t___ [填完整单词]","answer":"taxi","explanation_cn":"taxi 读 /ˈtæksi/，三个音都很短，take a taxi 打车。"},{"id":"w7-tue-kb3","type":"fill","question":"他自己的：h_______ [填完整单词]","answer":"himself","explanation_cn":"him + self，反身代词；她自己用 herself，我自己用 myself。"}]}]},{"day_cn":"周三","day_en":"Wednesday","is_speaking_day":true,"total_duration":57,"theme_cn":"作文跟读 + AI口语 + Exercise02词汇 + 阅读理解 + 键盘拼写","modules":[{"id":"w7-wed-wd","name_cn":"作文跟读 · 背诵","type":"writing_drill","duration":6,"title":"第 6 句 · 结尾 + 全文回顾开头","focus_cn":"See you tomorrow! 读出开心的语气，结尾署名 Tom","full_text":"See you tomorrow! Tom Dear Lucy, I am so happy to go shopping with you tomorrow.","cn_list":["明天见！汤姆","亲爱的Lucy，明天能和你一起去购物我太开心了。"],"blank_list":["tomorrow","shopping"],"blank_cn_list":["明天","购物"],"full_text_cn":"明天见！汤姆亲爱的Lucy，明天能和你一起去购物我太开心了。","pass_score":60},{"id":"w7-wed-speaking","name_cn":"AI口语练习","type":"speaking","duration":30,"questions":[{"id":"w7-wed-sp1","type":"choice","sentence":"What do you think of the old arts in China, such as shadow puppetry?","sentence_cn":"你觉得皮影戏这样的中国老艺术怎么样？","options":["I think they are amazing, because a small puppet can tell a whole story.","There are many old arts in China.","I watched a cartoon about a cat yesterday.","My grandpa is seventy years old this year."],"answer":0,"pronunciation_tips":"amazing /əˈmeɪzɪŋ/ 重音在第二音节，puppetry /ˈpʌpɪtri/ 三个音节都要清楚","explanation_cn":"问的是「你觉得怎么样」，必须先表态再给理由。A 有 I think they are amazing + because；B 是客观叙述；C、D 完全没有说看法。","answer_cn_hint":"先说 I think they are …，再用 because 说一条理由，比如有意思、有历史。","options_cn":["我觉得它们很了不起，因为一个小皮影就能讲完一整个故事。","中国有很多古老的艺术。","我昨天看了一部关于猫的动画片。","我爷爷今年七十岁。"]},{"id":"w7-wed-sp2","type":"choice","sentence":"Would you like to learn shadow puppetry? Why?","sentence_cn":"你想学皮影戏吗？为什么？","options":["Yes, I would love to, because I want to make my own puppet and tell a story with it.","Shadow puppetry is performed behind a screen.","I am very busy with my homework this week.","Many visitors watch puppet shows in the museum."],"answer":0,"pronunciation_tips":"Would you 连读 /wʊdʒu/，puppet /ˈpʌpɪt/ 两个 p 只发一个音","explanation_cn":"Would you like to…? 要先答 Yes 或 No，再讲原因。A 两项都有；B 是知识；C 说忙但没表态；D 说别人，答非所问。","answer_cn_hint":"先回答 Yes, I would love to 或 No, thanks，再用 because 说原因。","options_cn":["想，我很愿意，因为我想自己做一个皮影，用它来讲故事。","皮影戏是在幕布后面表演的。","我这周作业很多，很忙。","很多游客在博物馆看皮影戏。"]},{"id":"w7-wed-sp3","type":"choice","sentence":"What do you usually do in your art class at school?","sentence_cn":"你们学校的美术课通常做什么？","options":["We usually draw pictures and sometimes make things with paper and clay.","My art teacher is a young woman.","I forgot to bring my colour pencils today.","There are forty students in my class."],"answer":0,"pronunciation_tips":"usually /ˈjuːʒuəli/ 中间读 /ʒ/，clay /kleɪ/ 是橡皮泥、黏土的意思","explanation_cn":"问「通常做什么」，要用一般现在时讲习惯。A 说了画画的两种常做的事；B、D 介绍人和班级；C 说今天的一次疏忽。","answer_cn_hint":"用 We usually + 动词原形，说出美术课上常做的两件事。","options_cn":["我们通常画画，有时候用纸和橡皮泥做手工。","我的美术老师是一位年轻的女老师。","我今天忘了带彩笔。","我们班有四十个学生。"]},{"id":"w7-wed-sp4","type":"choice","sentence":"Which is more interesting to you, watching a film or watching a puppet show?","sentence_cn":"对你来说，看电影和看皮影戏哪个更有意思？","options":["Watching a puppet show is more interesting, because the puppets are moved by real hands.","Films are shown in cinemas and on phones.","I watched two films during the holiday.","My cousin likes cartoon films very much."],"answer":0,"pronunciation_tips":"interesting /ˈɪntrəstɪŋ/ 重音在第一个音节，puppet 里的 t 要轻爆破","explanation_cn":"这是二选一，答句要选边并说明理由。A 选了皮影戏并给原因；B 讲电影的播放方式；C、D 说的是数量和别人，都没有比较。","answer_cn_hint":"用 … is more interesting, because … 先选一个再讲理由。","options_cn":["看皮影戏更有意思，因为皮影是真人的手在操纵的。","电影在电影院和手机上都能看到。","假期里我看了两部电影。","我表弟非常喜欢动画电影。"]},{"id":"w7-wed-sp5","type":"choice","sentence":"How do old arts become popular again with young people?","sentence_cn":"老艺术怎样才能重新在年轻人中流行起来？","options":["Old arts can become popular if schools teach them and videos show them in a fun way.","Old arts are hundreds of years old.","Some old arts are difficult to learn.","My teacher told us about an old art last week."],"answer":0,"pronunciation_tips":"popular /ˈpɒpjələ/ 重音在前，if 引导条件句时读得轻快","explanation_cn":"How 问方法，答句要给出做法。A 说了两条办法（学校教、视频拍得有趣）；B、C 是现状描述；D 说老师讲的内容，都没给办法。","answer_cn_hint":"用 … can … if … 说出办法，比如进课堂、拍短视频、做文创。","options_cn":["如果学校教这些老艺术，视频又把它拍得有趣，它们就能流行起来。","老艺术都有几百年历史了。","有些老艺术很难学。","上周老师给我们讲了一种老艺术。"]}]},{"id":"w7-wed-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"barbecue","phonetic":"/ˈbɑːbɪkjuː/","meaning":"烧烤","emoji":"🍖","example_en":"A group of us will have a barbecue this weekend.","example_cn":"我们这群人这周末要去烧烤。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🎈","🏖️","🍖","👏"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🏖️","👏","🍖","🏀"],"answer":2},{"type":"meaning_choice","prompt":"barbecue 是什么意思？（1/2）","options":["烧烤","篮球","气球","海边；海滨"],"answer":0},{"type":"meaning_choice","prompt":"barbecue 是什么意思？（2/2）","options":["观众","气球","烧烤","海边；海滨"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: bar__cue","answer":"be"}],"letters":["b","a","r","b","e","c","u","e"],"syllables":["bar","be","cue"],"hint_cn":"户外生火烤肉吃的那种聚会"},{"word":"seaside","phonetic":"/ˈsiːsaɪd/","meaning":"海边；海滨","emoji":"🏖️","example_en":"I am going to the seaside for a holiday this summer.","example_cn":"今年夏天我要去海边度假。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🎈","🍖","🏖️","🏀"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🏀","🍖","👏","🏖️"],"answer":3},{"type":"meaning_choice","prompt":"seaside 是什么意思？（1/2）","options":["篮球","海边；海滨","气球","烧烤"],"answer":1},{"type":"meaning_choice","prompt":"seaside 是什么意思？（2/2）","options":["海边；海滨","烧烤","篮球","气球"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: se__ide","answer":"as"}],"letters":["s","e","a","s","i","d","e"],"syllables":["sea","side"],"hint_cn":"sea 是大海，大海旁边的度假地"},{"word":"audience","phonetic":"/ˈɔːdiəns/","meaning":"观众","emoji":"👏","example_en":"The actors said goodbye to all the audience.","example_cn":"演员们向所有观众道别。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🎈","🍖","🏖️","👏"],"answer":3},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🎈","🍖","👏","🏖️"],"answer":2},{"type":"meaning_choice","prompt":"audience 是什么意思？（1/2）","options":["气球","观众","篮球","海边；海滨"],"answer":1},{"type":"meaning_choice","prompt":"audience 是什么意思？（2/2）","options":["烧烤","篮球","观众","海边；海滨"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: aud__nce","answer":"ie"}],"letters":["a","u","d","i","e","n","c","e"],"syllables":["au","di","ence"],"hint_cn":"坐在台下看表演的一群人"},{"word":"balloon","phonetic":"/bəˈluːn/","meaning":"气球","emoji":"🎈","example_en":"The little boy bought a red balloon.","example_cn":"小男孩买了一个红气球。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🎈","🏖️","🏀","🍖"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["👏","🏀","🎈","🏖️"],"answer":2},{"type":"meaning_choice","prompt":"balloon 是什么意思？（1/2）","options":["篮球","海边；海滨","观众","气球"],"answer":3},{"type":"meaning_choice","prompt":"balloon 是什么意思？（2/2）","options":["气球","篮球","烧烤","海边；海滨"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: ba__oon","answer":"ll"}],"letters":["b","a","l","l","o","o","n"],"syllables":["bal","loon"],"hint_cn":"圆圆的、吹足气会飞上天的球"},{"word":"basketball","phonetic":"/ˈbɑːskɪtbɔːl/","meaning":"篮球","emoji":"🏀","example_en":"Yao Ming is an excellent Chinese basketball player.","example_cn":"姚明是一位出色的中国篮球运动员。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🏀","🍖","🏖️","🎈"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🍖","🏀","🏖️","🎈"],"answer":1},{"type":"meaning_choice","prompt":"basketball 是什么意思？（1/2）","options":["烧烤","观众","篮球","气球"],"answer":2},{"type":"meaning_choice","prompt":"basketball 是什么意思？（2/2）","options":["篮球","烧烤","海边；海滨","观众"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: bask__ball","answer":"et"}],"letters":["b","a","s","k","e","t","b","a","l","l"],"syllables":["bas","ket","ball"],"hint_cn":"basket 是篮子，往篮里投的球"}]},{"id":"w7-wed-reading","name_cn":"阅读理解 · 库布其治沙","type":"reading","duration":10,"passage":"Kubuqi is a large desert in Inner Mongolia, and it is close to the Yellow River. Long ago the wind blew the sand into the river and over the farms, so people could not grow food there. In 1988 a farmer named Wang Wenbiao started to plant sand willows to stop the sand. Villagers also put dry straw into square grids on the sand, and grass came back inside the grids. Today more than half of the desert is green again, and birds and foxes have returned. Trains on the railway there no longer stop because of sandstorms.","passage_cn":"库布其是内蒙古的一片大沙漠，它离黄河很近。很久以前，风把沙子吹进黄河、又吹到农田上，人们在那里种不出粮食。一九八八年，一位叫王文彪的农民开始种沙柳，用来挡住沙子。村民们还把干稻草铺成一个个方格压在沙上，草就在方格里长了出来。今天这片沙漠有一半以上又变绿了，鸟和狐狸也回来了。那里的火车再也不会因为沙尘暴而停下来。","questions":[{"id":"w7-wed-rd1","type":"choice","question":"Where is the Kubuqi desert?","options":["In Inner Mongolia","In Guangdong","On an island","Near Shanghai"],"answer":0,"explanation_cn":"第一句说 Kubuqi is a large desert in Inner Mongolia（在内蒙古），它靠近黄河。"},{"id":"w7-wed-rd2","type":"choice","question":"What did the villagers put on the sand?","options":["Dry straw in square grids","Wet paper in big boxes","Plastic bags and bottles","Salt water from the sea"],"answer":0,"explanation_cn":"第四句说 villagers put dry straw into square grids（把干稻草铺成方格），草就在方格里长出来。"},{"id":"w7-wed-rd3","type":"choice","question":"What happens inside the grids after the straw work?","options":["Grass grows back","The sand turns into stone","The river moves away","The desert gets bigger"],"answer":0,"explanation_cn":"第四句后半说 grass came back inside the grids（方格里长回了草）。"}]},{"id":"w7-wed-kb","name_cn":"今天学的词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w7-wed-kb1","type":"fill","question":"烧烤：b_______ [填完整单词]","answer":"barbecue","explanation_cn":"barbecue 读 /ˈbɑːbɪkjuː/，重音在最前，口语里常简写成 BBQ。"},{"id":"w7-wed-kb2","type":"fill","question":"观众：a_______ [填完整单词]","answer":"audience","explanation_cn":"audience 读 /ˈɔːdiəns/，开头 au 读 /ɔː/，集合名词「观众们」。"},{"id":"w7-wed-kb3","type":"fill","question":"气球：b______ [填完整单词]","answer":"balloon","explanation_cn":"balloon 有两个 o，结尾双 l：bal + loon。"}]}]},{"day_cn":"周四","day_en":"Thursday","is_speaking_day":false,"total_duration":37,"theme_cn":"作文跟读 + 阅读理解 + 合成代词语法 + 听力 + 键盘拼写","modules":[{"id":"w7-thu-wd","name_cn":"作文跟读 · 背诵","type":"writing_drill","duration":6,"title":"第 2~4 句 · 中段复习","focus_cn":"meet at your home 里的 at 不要读漏，o'clock 注意吞音","full_text":"We can meet at your home. Is 10 o'clock OK? Then we can take a taxi.","cn_list":["我们可以在你家碰面。","10点钟行吗？","然后我们可以打出租车去。"],"blank_list":["at","is","taxi"],"blank_cn_list":["小地点前用的介词「在」","问句开头的「是」（敲小写就行）","出租车"],"full_text_cn":"我们可以在你家碰面。10点钟行吗？然后我们可以打出租车去。","pass_score":60},{"id":"w7-thu-reading","name_cn":"阅读理解 · 城市绿道","type":"reading","duration":10,"passage":"Last month our city opened a new greenway along an old railway line. The greenway is eleven kilometres long, and no cars are allowed on it. There are two lines on the road: one for walking and one for bikes. Young trees and flowers grow on both sides, and the lamps there get power from the sun. My family walks there after dinner, and I have met many neighbours on the way. At the weekend a small bus comes to the gate, so people do not need to drive.","passage_cn":"上个月我们城市沿着一条旧铁路线新开了一条绿道。这条绿道有十一公里长，上面不允许汽车通行。路上分成两条道：一条给步行的，一条给自行车的。两侧长着小树和花，那里的路灯靠太阳发电。我们全家晚饭后去那里散步，我在路上认识了很多邻居。周末有一辆小公交开到入口，所以人们不用开车来。","questions":[{"id":"w7-thu-rd1","type":"choice","question":"What was there before the greenway was built?","options":["An old railway line","A big shopping mall","A football field","A swimming pool"],"answer":0,"explanation_cn":"第一句说 opened a new greenway along an old railway line（沿着旧铁路线修绿道）。"},{"id":"w7-thu-rd2","type":"choice","question":"Who can use the greenway?","options":["People on foot and people on bikes","People in cars","Only children under ten","Only bus drivers"],"answer":0,"explanation_cn":"第二、三句说 no cars are allowed，并分成 walking 和 bikes 两条道。"},{"id":"w7-thu-rd3","type":"choice","question":"Where do the lamps get their power?","options":["From the sun","From the wind","From the river","From the bikes"],"answer":0,"explanation_cn":"第四句说 the lamps there get power from the sun（靠太阳发电）。"}]},{"id":"w7-thu-grammar","name_cn":"形容词比较级","type":"grammar","duration":10,"questions":[{"id":"w7-thu-gr1","type":"fill","question":"用括号里代词的适当形式填空：Are these ___ (they) bags?","answer":"their","explanation_cn":"bags 是名词，前面要用形容词性物主代词 their（他们的）。"},{"id":"w7-thu-gr2","type":"fill","question":"用括号里代词的适当形式填空：Hurry up, they are waiting for ___ (we).","answer":"us","explanation_cn":"介词 for 后面用宾格，we 的宾格是 us：waiting for us 在等我们。"},{"id":"w7-thu-gr3","type":"fill","question":"用括号里代词的适当形式填空：The little baby ate food by ___ (he).","answer":"himself","explanation_cn":"by oneself 是固定搭配「独自地」，by himself = 他自己一个人吃。"},{"id":"w7-thu-gr4","type":"fill","question":"用括号里代词的适当形式填空：Your classroom is bigger than ___ (our).","answer":"ours","explanation_cn":"比较的是「你们的教室」和「我们的教室」，后面没有名词，用名词性物主代词 ours。"},{"id":"w7-thu-gr5","type":"fill","question":"选词填空（anyone / anybody / anything / anywhere / everyone / everything / nothing / someone / somewhere）：There is not ___ in the classroom, because the students are having a PE class.","answer":"anyone","explanation_cn":"这是一个否定句（There is not），否定句和疑问句里用 any- 开头的词：anyone 任何人。"},{"id":"w7-thu-gr6","type":"fill","question":"选词填空（anyone / anybody / anything / anywhere / everyone / everything / nothing / someone / somewhere）：I have ___ to do, because my mother has done everything for me.","answer":"nothing","explanation_cn":"妈妈把一切都做完了 → 我没有事情要做，用否定意思的 nothing。"}]},{"id":"w7-thu-listening","name_cn":"听力练习","type":"listening","duration":5,"questions":[{"id":"w7-thu-ls1","type":"choice","question":"Listen to the dialogue. How long is the greenway?","audio_text":"Boy: Mum, how long is this greenway? Mum: It is eleven kilometres long, so we can only walk six today. Boy: OK, let's go to the bridge first.","options":["Eleven kilometres","Six kilometres","Seventeen kilometres","One kilometre"],"answer":0,"explanation_cn":"妈妈说 It is eleven kilometres long（十一公里）；六公里是今天打算走的距离。"},{"id":"w7-thu-ls2","type":"choice","question":"Which picture matches the sentence you hear?","audio_text":"My father and I are riding our bikes along the greenway after dinner.","options":["🚲","🚗","🚌","✈️"],"picture_options":true,"answer":0,"explanation_cn":"句子里说的是 riding our bikes（骑自行车），所以选 🚲。"},{"id":"w7-thu-ls3","type":"fill","question":"Listen and fill in the blank: There are tall ___ on both sides of the greenway.","audio_text":"There are tall trees on both sides of the greenway, and they give us cool shade.","answer":"trees","explanation_cn":"听到 tall trees（高大的树），trees 是复数，结尾有 s。"}]},{"id":"w7-thu-kb","name_cn":"阅读里的重点词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w7-thu-kb1","type":"fill","question":"任何地方：a_______ [填完整单词]","answer":"anywhere","explanation_cn":"any + where；否定句和疑问句里用 any- 开头的词。"},{"id":"w7-thu-kb2","type":"fill","question":"每个人：e________ [填完整单词]","answer":"everyone","explanation_cn":"every + one，写成一个词；every body 合成 everybody 也是一词。"},{"id":"w7-thu-kb3","type":"fill","question":"每件事：e_________ [填完整单词]","answer":"everything","explanation_cn":"every + thing；thing 是「事情」，everything = 所有事。"}]}]},{"day_cn":"周五","day_en":"Friday","is_speaking_day":false,"total_duration":52,"theme_cn":"作文跟读 + 合成代词语法 + 听力 + KET词汇 + 背默作文 + 键盘拼写","modules":[{"id":"w7-fri-wd","name_cn":"作文跟读 · 背诵","type":"writing_drill","duration":6,"title":"第 5~6 句 · 重点句冲刺","focus_cn":"buy new football boots 是最长的一句，放慢读；See you tomorrow! 读出开心的语气收尾","full_text":"I want to buy new football boots and some pairs of socks. See you tomorrow! Tom","cn_list":["我想买新足球鞋和几双袜子。","明天见！汤姆"],"blank_list":["boots","tomorrow"],"blank_cn_list":["球场上穿的靴子","明天"],"full_text_cn":"我想买新足球鞋和几双袜子。明天见！汤姆","pass_score":60},{"id":"w7-fri-grammar","name_cn":"介词 in / on / at","type":"grammar","duration":10,"questions":[{"id":"w7-fri-gr1","type":"fill","question":"选词填空（anyone / anybody / anything / anywhere / everyone / everything / nothing / someone / somewhere）：___ called you this afternoon, but I cannot remember his name.","answer":"someone","explanation_cn":"肯定句里用 some- 开头的词：someone 某人。答案敲小写 someone 就行。"},{"id":"w7-fri-gr2","type":"fill","question":"选词填空（anyone / anybody / anything / anywhere / everyone / everything / nothing / someone / somewhere）：I cannot find my dog ___.","answer":"anywhere","explanation_cn":"否定句（cannot）里用 any- 开头的词：anywhere 任何地方，哪儿都找不到。"},{"id":"w7-fri-gr3","type":"fill","question":"选词填空（anyone / anybody / anything / anywhere / everyone / everything / nothing / someone / somewhere）：The little girl is running on the playground by herself; she does not run with ___.","answer":"anybody","explanation_cn":"她自己一个人跑，不和任何人一起跑 → 否定意思用 anybody。"},{"id":"w7-fri-gr4","type":"fill","question":"选词填空（anyone / anybody / anything / anywhere / everyone / everything / nothing / someone / somewhere）：Just relax, you cannot finish ___ at the same time.","answer":"everything","explanation_cn":"cannot finish everything = 不可能一次把所有事都做完。"},{"id":"w7-fri-gr5","type":"fill","question":"选词填空（anyone / anybody / anything / anywhere / everyone / everything / nothing / someone / somewhere）：All the students are having class now, so ___ is here.","answer":"everyone","explanation_cn":"所有人都到齐了 → 肯定句用 everyone 每个人。"}]},{"id":"w7-fri-listening","name_cn":"听力 · 地铁出行","type":"listening","duration":5,"questions":[{"id":"w7-fri-ls1","type":"choice","question":"Listen to the dialogue. Which line goes to the city museum?","audio_text":"Woman: Excuse me, which line goes to the city museum? Man: Line Two, and the museum is the third stop. Woman: Thank you very much.","options":["Line Two","Line Five","Line Three","Line One"],"answer":0,"explanation_cn":"男士说 Line Two（二号线），the third stop 是「第三站」，不是三号线。"},{"id":"w7-fri-ls2","type":"choice","question":"Listen to the dialogue. How will the girl go to school today?","audio_text":"Dad: The road is busy this morning, so we will take the subway. Girl: Good idea, it is faster than the bus. Dad: We need to change at the next station.","options":["By subway","By bus","By car","On foot"],"answer":0,"explanation_cn":"爸爸说 we will take the subway（我们坐地铁），因为地铁比公交车快。"},{"id":"w7-fri-ls3","type":"choice","question":"Which picture matches the sentence you hear?","audio_text":"Many people are waiting for the train on the platform.","options":["🚇","🚕","⛴️","🚁"],"picture_options":true,"answer":0,"explanation_cn":"句子里说 waiting for the train on the platform（在站台等地铁），所以选 🚇。"},{"id":"w7-fri-ls4","type":"fill","question":"Listen and fill in the blank: Please stand behind the yellow ___.","audio_text":"Please stand behind the yellow line and let the people get off first.","answer":"line","explanation_cn":"听到 stand behind the yellow line（站在黄线后面），所以填 line。"}]},{"id":"w7-fri-ket_pet","name_cn":"KET/PET题型","type":"ket_pet","duration":10,"questions":[{"id":"w7-fri-kp1","type":"choice","question":"KET: I made an ___ with Mark to go fishing on Saturday.","options":["appointment","answer","attention","apple"],"answer":0,"explanation_cn":"make an appointment with sb. 是固定搭配「和某人约定」；an 后面接元音开头的 appointment。"},{"id":"w7-fri-kp2","type":"choice","question":"KET: Tom told me his parents had arrived ___ Beijing.","options":["at","to","in","on"],"answer":2,"explanation_cn":"arrive in + 大地方（城市、国家），arrive at + 小地点。北京是大城市，用 arrive in Beijing。"},{"id":"w7-fri-kp3","type":"choice","question":"KET: Uncle Lee usually spends his summer holiday in the rural ___.","options":["part","area","side","line"],"answer":1,"explanation_cn":"rural area 是固定说法「乡村地区」；area 指一片区域。"},{"id":"w7-fri-kp4","type":"choice","question":"KET: A room for taking a shower is called a ___.","options":["bathroom","bedroom","classroom","kitchen"],"answer":0,"explanation_cn":"bath 是洗澡，bathroom = 浴室；bedroom 睡觉，classroom 上课，kitchen 做饭。"},{"id":"w7-fri-kp5","type":"choice","question":"KET: A ___ is a person who helps you with your work.","options":["assistant","artist","engineer","driver"],"answer":0,"explanation_cn":"assist 是「帮助」，assistant = 助手/店员，是帮你干活的人。"}]},{"id":"w7-fri-writing","name_cn":"背诵作文 · 写给朋友的邮件","type":"writing_template","duration":15,"title":"Dear Lucy（四线三格作文 · 全文背默）","requirement_cn":"先把整封信大声读三遍，再把 5 个空填好，最后背诵全文。这封短信就是本周要背熟的作文！","keywords":["shopping","home","taxi","football","socks"],"keywords_cn":["购物","家","出租车","足球","袜子"],"template":"Dear Lucy, I am so happy to go {{1}} with you tomorrow. We can meet at your {{2}}. Is 10 o'clock OK? Then we can take a {{3}}. I want to buy new {{4}} boots and some pairs of {{5}}. See you tomorrow! Tom","blanks":[{"id":1,"hint_cn":"购物","hint_en":"shopping","answer":"shopping"},{"id":2,"hint_cn":"家","hint_en":"home","answer":"home"},{"id":3,"hint_cn":"出租车","hint_en":"taxi","answer":"taxi"},{"id":4,"hint_cn":"足球","hint_en":"football","answer":"football"},{"id":5,"hint_cn":"袜子","hint_en":"socks","answer":"socks"}],"full_text":"Dear Lucy, I am so happy to go shopping with you tomorrow. We can meet at your home. Is 10 o'clock OK? Then we can take a taxi. I want to buy new football boots and some pairs of socks. See you tomorrow! Tom","full_text_cn":"亲爱的Lucy，明天能和你一起去购物我太开心了。我们可以在你家碰面。10点钟行吗？然后我们可以打出租车去。我想买新足球鞋和几双袜子。明天见！","explanation_cn":"英文书信三要素：称呼 Dear Lucy 开头、正文说清「和谁、几点、干什么」、结尾 See you tomorrow! 加署名 Tom。go shopping 去购物；meet at your home 在你家碰面（小地点用 at）；take a taxi 打车；a pair of socks 一双袜子，两双就是 two pairs of socks。","explanation_en":"A short note needs a greeting (Dear Lucy), the plan (when, where, what), and a closing (See you tomorrow!) with the name Tom."},{"id":"w7-fri-kb","name_cn":"今天的重点词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w7-fri-kb1","type":"fill","question":"约定；预约：a___________ [填完整单词]","answer":"appointment","explanation_cn":"appoint + ment；make an appointment with sb. 和某人约好。"},{"id":"w7-fri-kb2","type":"fill","question":"地区：a___ [填完整单词]","answer":"area","explanation_cn":"area 读 /ˈeəriə/，三个字母 a、r、e 加一个 a，别漏掉结尾的 a。"},{"id":"w7-fri-kb3","type":"fill","question":"足球鞋：b____ [填完整单词]","answer":"boots","explanation_cn":"boot 加 s；一双靴子 a pair of boots，作文里是 football boots。"}]}]},{"day_cn":"周六","day_en":"Saturday","is_speaking_day":true,"total_duration":57,"theme_cn":"作文跟读 + AI口语 + Exercise02词汇 + 阅读理解 + 键盘拼写","modules":[{"id":"w7-sat-wd","name_cn":"作文跟读 · 背诵","type":"writing_drill","duration":6,"title":"第 1、3 句 · 开头复习","focus_cn":"全文背一周了，检查 Dear Lucy 开头和 Is 10 o'clock OK? 还记不记得","full_text":"Dear Lucy, I am so happy to go shopping with you tomorrow. Is 10 o'clock OK?","cn_list":["亲爱的Lucy，明天能和你一起去购物我太开心了。","10点钟行吗？"],"blank_list":["shopping","is"],"blank_cn_list":["购物","问句开头的「是」（敲小写就行）"],"full_text_cn":"亲爱的Lucy，明天能和你一起去购物我太开心了。10点钟行吗？","pass_score":60},{"id":"w7-sat-speaking","name_cn":"AI口语练习","type":"speaking","duration":30,"questions":[{"id":"w7-sat-sp1","type":"choice","sentence":"How do you usually go to school, and why?","sentence_cn":"你通常怎么去上学？为什么？","options":["I usually go to school by subway, because it is quick and never late.","My school is ten minutes' walk from my home.","I went to school at seven this morning.","There are many bikes near the school gate."],"answer":0,"pronunciation_tips":"usually /ˈjuːʒuəli/ 中间是 /ʒ/，subway 重音在前，never late 连读自然","explanation_cn":"问句有两问：怎么去 + 为什么。A 两个都答了（by subway + because）；B 只说距离；C 说今天的时间；D 说门口的自行车。","answer_cn_hint":"先说交通方式（by bus / by subway / on foot），再用 because 说一条理由。","options_cn":["我通常坐地铁上学，因为它很快而且从不迟到。","我家到学校走路只要十分钟。","今天早上我七点去上学。","学校门口有很多自行车。"]},{"id":"w7-sat-sp2","type":"choice","sentence":"What is the best way to travel in a big city?","sentence_cn":"在大城市里出行，最好的方式是什么？","options":["The best way is to take the subway, because it is fast and there are no traffic jams.","Big cities are usually very busy.","I have a new bike at home.","Taxis in the city are yellow."],"answer":0,"pronunciation_tips":"traffic /ˈtræfɪk/ 重音在前，jams /dʒæmz/ 词尾要出声","explanation_cn":"问「最好的方式」，答句要用 The best way is… 给出方法并说明理由。A 两项都有；B、D 是描述；C 说家里有什么。","answer_cn_hint":"用 The best way is to + 动词原形，再说 because 讲理由。","options_cn":["最好的方式是坐地铁，因为它快而且不会堵车。","大城市通常很繁忙。","我家里有一辆新自行车。","城里的出租车是黄色的。"]},{"id":"w7-sat-sp3","type":"choice","sentence":"Why do people like the subway better than cars in big cities?","sentence_cn":"在大城市里，人们为什么更喜欢地铁而不是开车？","options":["Because the subway is faster in busy hours and we can read on the train.","Because cars are expensive to buy.","Because the subway was built many years ago.","Because my mother cannot drive."],"answer":0,"pronunciation_tips":"busy hours 连读 /ˈbɪziˈaʊəz/，than 在句中弱读成 /ðən/","explanation_cn":"Why 问原因，要用 because 讲出好处。A 说了两点（更快、能读书）；B 说的是买车的价格；C 说修建时间；D 说妈妈，都不是「更喜欢」的理由。","answer_cn_hint":"用 Because + 完整句子说出好处，比如 faster、no traffic jams、can read。","options_cn":["因为高峰时地铁更快，我们还能在车上读书。","因为买车很贵。","因为地铁是很多年前修的。","因为我妈妈不会开车。"]},{"id":"w7-sat-sp4","type":"choice","sentence":"What would you like to change about the transport in your city?","sentence_cn":"你希望自己城市的交通有什么改变？","options":["I would like more buses at night, so that people can go home later.","There are three bus lines near my home.","The transport in my city is very good now.","I take the bus with my mother every Sunday."],"answer":0,"pronunciation_tips":"change /tʃeɪndʒ/ 词尾是 /dʒ/，so that 连读，later /ˈleɪtə/ 注意卷舌","explanation_cn":"问「希望改变什么」，答句要用 I would like… 提出具体建议。A 提出晚上加开车次；B、D 说现状；C 说现在很好，都没有提改变。","answer_cn_hint":"用 I would like + 名词/更多车次 说出一个具体愿望，再说这有什么好处。","options_cn":["我希望晚上有更多公交车，这样人们可以晚一点回家。","我家附近有三条公交线路。","我们城市的交通现在很好。","每个星期天我和妈妈坐公交车。"]},{"id":"w7-sat-sp5","type":"choice","sentence":"What should you do when you see an old man standing on the subway?","sentence_cn":"在地铁上看到一位老人站着，你应该怎么做？","options":["I should give my seat to him and help him hold his bag.","Old people often take the subway in the morning.","The subway train is very long.","I usually listen to music on the subway."],"answer":0,"pronunciation_tips":"seat /siːt/ 和 sit /sɪt/ 要区分，should /ʃʊd/ 的 l 不发音","explanation_cn":"问「应该怎么做」，答句要给行动。A 给了让座、帮拿包两件事；B、C 是描述；D 说自己平时的习惯，都没回答「应该」。","answer_cn_hint":"用 I should + 动词原形说出应该做的事，比如 give my seat to him。","options_cn":["我应该把座位让给他，还帮他拿一下包。","老人常常早上去坐地铁。","地铁列车很长。","我坐地铁时通常听音乐。"]}]},{"id":"w7-sat-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"around","phonetic":"/əˈraʊnd/","meaning":"在…周围；到处","emoji":"🔄","example_en":"Beijing Roast Duck is famous around the world.","example_cn":"北京烤鸭闻名全世界。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🌸","📅","🔄","🗺️"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🌸","🗺️","🔄","📅"],"answer":2},{"type":"meaning_choice","prompt":"around 是什么意思？（1/2）","options":["变成；成为","在…周围；到处","约定；预约","可爱的；漂亮的"],"answer":1},{"type":"meaning_choice","prompt":"around 是什么意思？（2/2）","options":["在…周围；到处","变成；成为","可爱的；漂亮的","约定；预约"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: ar__nd","answer":"ou"}],"letters":["a","r","o","u","n","d"],"syllables":["a","round"],"hint_cn":"a + round，绕着圈把东西围起来"},{"word":"lovely","phonetic":"/ˈlʌvli/","meaning":"可爱的；漂亮的","emoji":"🌸","example_en":"My mother bought me a lovely hat as my birthday gift.","example_cn":"妈妈买了一顶漂亮的帽子作为我的生日礼物。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🦋","🔄","📅","🌸"],"answer":3},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["📅","🌸","🦋","🗺️"],"answer":1},{"type":"meaning_choice","prompt":"lovely 是什么意思？（1/2）","options":["在…周围；到处","地区；区域","可爱的；漂亮的","约定；预约"],"answer":2},{"type":"meaning_choice","prompt":"lovely 是什么意思？（2/2）","options":["在…周围；到处","变成；成为","地区；区域","可爱的；漂亮的"],"answer":3},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: lo__ly","answer":"ve"}],"letters":["l","o","v","e","l","y"],"syllables":["love","ly"],"hint_cn":"love + ly，让人一见就喜欢的"},{"word":"become","phonetic":"/bɪˈkʌm/","meaning":"变成；成为","emoji":"🦋","example_en":"The music teacher wants his students to become musicians.","example_cn":"音乐老师希望他的学生们成为音乐家。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["📅","🌸","🦋","🗺️"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🔄","🦋","📅","🌸"],"answer":1},{"type":"meaning_choice","prompt":"become 是什么意思？（1/2）","options":["地区；区域","变成；成为","约定；预约","可爱的；漂亮的"],"answer":1},{"type":"meaning_choice","prompt":"become 是什么意思？（2/2）","options":["变成；成为","约定；预约","可爱的；漂亮的","地区；区域"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: be__me","answer":"co"}],"letters":["b","e","c","o","m","e"],"syllables":["be","come"],"hint_cn":"be + come，慢慢会长成那个样子"},{"word":"appointment","phonetic":"/əˈpɔɪntmənt/","meaning":"约定；预约","emoji":"📅","example_en":"I made an appointment with the doctor at three.","example_cn":"我和医生约好了三点见面。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🌸","📅","🦋","🗺️"],"answer":1},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🗺️","📅","🌸","🦋"],"answer":1},{"type":"meaning_choice","prompt":"appointment 是什么意思？（1/2）","options":["在…周围；到处","变成；成为","约定；预约","地区；区域"],"answer":2},{"type":"meaning_choice","prompt":"appointment 是什么意思？（2/2）","options":["在…周围；到处","可爱的；漂亮的","约定；预约","地区；区域"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: appo__tment","answer":"in"}],"letters":["a","p","p","o","i","n","t","m","e","n","t"],"syllables":["ap","point","ment"],"hint_cn":"和别人说好几点碰面的那个约"},{"word":"area","phonetic":"/ˈeəriə/","meaning":"地区；区域","emoji":"🗺️","example_en":"Uncle Lee lives in a quiet rural area.","example_cn":"李叔叔住在一个安静的乡村地区。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🔄","🌸","🦋","🗺️"],"answer":3},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🔄","🗺️","🦋","🌸"],"answer":1},{"type":"meaning_choice","prompt":"area 是什么意思？（1/2）","options":["地区；区域","可爱的；漂亮的","约定；预约","变成；成为"],"answer":0},{"type":"meaning_choice","prompt":"area 是什么意思？（2/2）","options":["约定；预约","在…周围；到处","地区；区域","可爱的；漂亮的"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: a__a","answer":"re"}],"letters":["a","r","e","a"],"syllables":["a","re","a"],"hint_cn":"地图上圈出来的一片地方"}]},{"id":"w7-sat-reading","name_cn":"阅读理解 · 上海地铁","type":"reading","duration":10,"passage":"Shanghai has the longest subway system in China, and more than twenty lines run under the city. The first line opened in 1993, and today millions of people take the subway every day. At the station you buy a ticket from a machine or use your phone, and then you wait behind the yellow line. Trains come every two or three minutes, so you never wait for long. Inside the train there is a map above the doors, and a voice tells you the next station. My father says the subway is the fastest way to cross the city in the morning.","passage_cn":"上海有中国最长的地铁系统，二十多条线路在城市地下穿行。第一条线路在一九九三年开通，今天每天有几百万人坐地铁。在车站你可以从机器上买票，也可以用手机，然后站在黄线后面等车。列车每两三分钟就来一趟，所以你从来不用等很久。车厢里门上方的位置有线路图，还有广播告诉你下一站。我爸爸说，早上市里最快的过城方式就是地铁。","questions":[{"id":"w7-sat-rd1","type":"choice","question":"How many subway lines run under Shanghai?","options":["More than twenty","About three","Only one","Fifty"],"answer":0,"explanation_cn":"第一句说 more than twenty lines run under the city（二十多条线路）。"},{"id":"w7-sat-rd2","type":"choice","question":"When did the first subway line open?","options":["In 1993","In 2003","In 1983","In 2019"],"answer":0,"explanation_cn":"第二句说 The first line opened in 1993（一九九三年开通）。"},{"id":"w7-sat-rd3","type":"choice","question":"Where should people wait at the station?","options":["Behind the yellow line","On the train","In the ticket office","At the gate"],"answer":0,"explanation_cn":"第三句说 wait behind the yellow line（在黄线后面等车）。"}]},{"id":"w7-sat-kb","name_cn":"今天学的词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w7-sat-kb1","type":"fill","question":"在周围：a_____ [填完整单词]","answer":"around","explanation_cn":"a + round；famous around the world 闻名世界。"},{"id":"w7-sat-kb2","type":"fill","question":"可爱的：l____ [填完整单词]","answer":"lovely","explanation_cn":"love 去 e 加 ly；lovely = beautiful 的近义词。"},{"id":"w7-sat-kb3","type":"fill","question":"变成：b_____ [填完整单词]","answer":"become","explanation_cn":"be + come；become a musician 成为音乐家。"}]}]},{"day_cn":"周日","day_en":"Sunday","is_speaking_day":false,"total_duration":27,"theme_cn":"作文跟读 + 词汇 + 完形 + 键盘拼写","modules":[{"id":"w7-sun-wd","name_cn":"作文跟读 · 背诵","type":"writing_drill","duration":6,"title":"第 4、5 句 · 收官自查","focus_cn":"一周背完，这两句是最容易漏的：take a taxi 和 football boots","full_text":"Then we can take a taxi. I want to buy new football boots and some pairs of socks.","cn_list":["然后我们可以打出租车去。","我想买新足球鞋和几双袜子。"],"blank_list":["taxi","boots"],"blank_cn_list":["出租车","球场上穿的靴子"],"full_text_cn":"然后我们可以打出租车去。我想买新足球鞋和几双袜子。","pass_score":60},{"id":"w7-sun-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"shopping","phonetic":"/ˈʃɒpɪŋ/","meaning":"购物","emoji":"🛍️","example_en":"I am so happy to go shopping with you tomorrow.","example_cn":"明天能和你一起去购物我太开心了。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🧦","🚕","🛍️","🎁"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🥾","🛍️","🎁","🧦"],"answer":1},{"type":"meaning_choice","prompt":"shopping 是什么意思？（1/2）","options":["购物","出租车","礼物","袜子"],"answer":0},{"type":"meaning_choice","prompt":"shopping 是什么意思？（2/2）","options":["购物","出租车","袜子","靴子"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: sho__ing","answer":"pp"}],"letters":["s","h","o","p","p","i","n","g"],"syllables":["shop","ping"],"hint_cn":"go + shopping，去店里买东西"},{"word":"taxi","phonetic":"/ˈtæksi/","meaning":"出租车","emoji":"🚕","example_en":"Then we can take a taxi.","example_cn":"然后我们可以打出租车。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🥾","🎁","🚕","🧦"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🧦","🛍️","🚕","🥾"],"answer":2},{"type":"meaning_choice","prompt":"taxi 是什么意思？（1/2）","options":["购物","礼物","出租车","袜子"],"answer":2},{"type":"meaning_choice","prompt":"taxi 是什么意思？（2/2）","options":["礼物","袜子","出租车","购物"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: t__i","answer":"ax"}],"letters":["t","a","x","i"],"syllables":["tax","i"],"hint_cn":"挥手就停、按表计价的那种车"},{"word":"boots","phonetic":"/buːts/","meaning":"靴子","emoji":"🥾","example_en":"I want to buy new football boots.","example_cn":"我想买新足球鞋。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🛍️","🧦","🚕","🥾"],"answer":3},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🛍️","🎁","🚕","🥾"],"answer":3},{"type":"meaning_choice","prompt":"boots 是什么意思？（1/2）","options":["购物","靴子","礼物","袜子"],"answer":1},{"type":"meaning_choice","prompt":"boots 是什么意思？（2/2）","options":["出租车","靴子","袜子","购物"],"answer":1},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: b__ts","answer":"oo"}],"letters":["b","o","o","t","s"],"syllables":["boots"],"hint_cn":"包住脚踝的那种鞋，球场上穿"},{"word":"socks","phonetic":"/sɒks/","meaning":"袜子","emoji":"🧦","example_en":"Please buy two pairs of socks for me.","example_cn":"请给我买两双袜子。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🧦","🛍️","🚕","🥾"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🚕","🥾","🛍️","🧦"],"answer":3},{"type":"meaning_choice","prompt":"socks 是什么意思？（1/2）","options":["购物","靴子","袜子","礼物"],"answer":2},{"type":"meaning_choice","prompt":"socks 是什么意思？（2/2）","options":["购物","袜子","礼物","靴子"],"answer":1},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: s__ks","answer":"oc"}],"letters":["s","o","c","k","s"],"syllables":["socks"],"hint_cn":"穿在鞋子里、到脚踝的那种"},{"word":"present","phonetic":"/ˈpreznt/","meaning":"礼物","emoji":"🎁","example_en":"Thank you for the lovely birthday present.","example_cn":"谢谢你可爱的生日礼物。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🧦","🛍️","🎁","🚕"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🥾","🎁","🧦","🚕"],"answer":1},{"type":"meaning_choice","prompt":"present 是什么意思？（1/2）","options":["礼物","靴子","购物","出租车"],"answer":0},{"type":"meaning_choice","prompt":"present 是什么意思？（2/2）","options":["靴子","袜子","购物","礼物"],"answer":3},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: pr__ent","answer":"es"}],"letters":["p","r","e","s","e","n","t"],"syllables":["pre","sent"],"hint_cn":"生日那天别人送你的那份惊喜"}]},{"id":"w7-sun-cloze","name_cn":"完形填空 · 运河边的一天","type":"cloze","duration":10,"passage":"Last Friday our class went on a trip along the Grand 1___. In the morning we visited an old water gate, and an engineer told us how the gate 2___ the boats go up and down. At noon we sat under the trees and ate the 3___ that our parents had made. In the afternoon we walked along the new green path and planted five small trees with our 4___. Our teacher said that long ago the wind carried 5___ into the river, but now the grass holds the soil. On the way back we took the subway, and the ride was much 6___ than the bus. I hope we can come again next spring.","questions":[{"id":"w7-sun-cz1","type":"choice","question":"1___","options":["canal","wall","tower","tunnel"],"answer":0,"explanation_cn":"沿着一趟研学之旅，英文里说 the Grand Canal（京杭大运河），所以填 canal。"},{"id":"w7-sun-cz2","type":"choice","question":"2___","options":["helps","helped","helping","to help"],"answer":0,"explanation_cn":"讲的是船闸一般的工作原理，用一般现在时第三人称单数 helps。"},{"id":"w7-sun-cz3","type":"choice","question":"3___","options":["lunch","homework","poster","ticket"],"answer":0,"explanation_cn":"中午在树下吃的是父母准备的午餐 lunch，其他三项不能吃。"},{"id":"w7-sun-cz4","type":"choice","question":"4___","options":["hands","bikes","books","phones"],"answer":0,"explanation_cn":"亲手种树是 plant trees with our hands（用我们的双手），是固定说法。"},{"id":"w7-sun-cz5","type":"choice","question":"5___","options":["sand","salt","paper","milk"],"answer":0,"explanation_cn":"风把沙子吹进河里——治沙前风沙大，所以是 sand；后文 grass holds the soil 也印证。"},{"id":"w7-sun-cz6","type":"choice","question":"6___","options":["faster","fastest","fast","more fast"],"answer":0,"explanation_cn":"much 后面接比较级，than 也提示比较，所以填 faster。"}]},{"id":"w7-sun-kb","name_cn":"今天学的词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w7-sun-kb1","type":"fill","question":"购物：s_______ [填完整单词]","answer":"shopping","explanation_cn":"本周作文主题词，背作文时一起默。"},{"id":"w7-sun-kb2","type":"fill","question":"袜子：s___ [填完整单词]","answer":"socks","explanation_cn":"sock 加 s，一双袜子 a pair of socks。"},{"id":"w7-sun-kb3","type":"fill","question":"礼物：p______ [填完整单词]","answer":"present","explanation_cn":"present 读 /ˈpreznt/，礼物；注意别和 parent（父母）拼混。"}]}]}];
const WEEK8 = [{"day_cn":"周一","day_en":"Monday","is_speaking_day":true,"total_duration":51,"theme_cn":"AI口语 + 高频词汇 + 阅读理解（茶马古道） + 键盘拼写","modules":[{"id":"w8-mon-speaking","name_cn":"AI口语练习","type":"speaking","duration":30,"questions":[{"id":"w8-mon-sp1","type":"choice","sentence":"How did people travel from one city to another in the past?","sentence_cn":"过去人们是怎么从一个城市去另一个城市的？","options":["In the past, people mostly walked, rode horses or took slow boats.","Trains are faster than horses.","I ride my bike to school every day.","There are many museums in old cities."],"answer":0,"pronunciation_tips":"past /pɑːst/ 和 passed 同音，mostly 重音在最前面，horses 词尾 /ɪz/ 要出声","explanation_cn":"问的是「过去怎么出行」，答句要说出过去的方式。A 用 In the past 开头说出三种方式；B 在比较快慢；C 说现在每天；D 介绍城市，都没回答问题。","answer_cn_hint":"用 In the past, people… 说出过去的交通方式，比如走路、骑马、坐船。","options_cn":["过去人们大多是走路、骑马或者坐慢船。","火车比马快。","我每天骑自行车上学。","古老的城市里有很多博物馆。"]},{"id":"w8-mon-sp2","type":"choice","sentence":"If you could ride a horse on an old road, where would you go?","sentence_cn":"如果你能骑马走一条老路，你会去哪里？","options":["I would ride along the old mountain road and look at the forests.","Horses eat grass and apples.","I rode a horse at the beach last summer.","Mountain roads are narrow and dangerous."],"answer":0,"pronunciation_tips":"would /wʊd/ 不要读成 will，mountain /ˈmaʊntən/ 中间的 t 轻轻带过","explanation_cn":"这是假设句，答句要用 I would… 说出地点和想做的事。A 两项都有；B 说马吃什么；C 是过去的经历；D 介绍山路，都没回答「会去哪里」。","answer_cn_hint":"用 I would go / ride… 说出你想去的地方，再用 and 或 because 补一句原因。","options_cn":["我会沿着老的山路骑马，看看两边的森林。","马吃草和苹果。","去年夏天我在海边骑过马。","山路又窄又危险。"]},{"id":"w8-mon-sp3","type":"choice","sentence":"What is a good way to carry heavy things without a car?","sentence_cn":"没有汽车的时候，运重东西有什么好办法？","options":["We can carry heavy things with a horse, a cart or a big basket on the back.","Heavy things are hard to move.","My schoolbag is heavy today.","Cars can go very fast on the road."],"answer":0,"pronunciation_tips":"cart /kɑːt/ 与 card 区别在词尾 d，basket /ˈbɑːskɪt/ 重音在前","explanation_cn":"How 问方法，答句要给出具体做法。A 说出三种运货办法；B 只是感叹；C 说书包；D 说汽车，都没有回答「用什么办法」。","answer_cn_hint":"用 We can + 动词原形，说出马、推车、背筐这些具体的办法。","options_cn":["我们可以用马、手推车或者背上的大筐来运重东西。","重的东西很难搬动。","我的书包今天很重。","汽车在路上能开得很快。"]},{"id":"w8-mon-sp4","type":"choice","sentence":"Which do you like better, travelling by train or walking in the mountains?","sentence_cn":"你更喜欢哪个：坐火车旅行还是在山里走路？","options":["I like walking in the mountains better, because I can hear birds and see small rivers.","Trains and mountains are both interesting.","I went to the mountains with my class last autumn.","Walking for a long time makes people tired."],"answer":0,"pronunciation_tips":"mountains /ˈmaʊntənz/ 词尾 s 别丢，because 重音在后，rivers /ˈrɪvəz/ 注意 v","explanation_cn":"二选一的问题要先选一个再给理由。A 选了走路并说了两点原因；B 两边都没选；C 讲经历；D 说缺点，都没有做出选择。","answer_cn_hint":"先说 I like … better，再用 because 说一条理由。","options_cn":["我更喜欢在山里走路，因为我能听见鸟叫，还能看见小河。","火车和山都很有意思。","去年秋天我和全班一起去了山里。","走太久会让人很累。"]},{"id":"w8-mon-sp5","type":"choice","sentence":"What can old roads and bridges tell us?","sentence_cn":"老路和老桥能告诉我们什么？","options":["They can tell us how people lived and travelled long ago.","Old bridges are made of stone or wood.","We should not write on old walls.","My hometown has a new bridge over the river."],"answer":0,"pronunciation_tips":"bridges /ˈbrɪdʒɪz/ 词尾 /ɪz/，lived 和 travelled 都是过去式，词尾 d 轻轻带过","explanation_cn":"What 问内容，答句要说老路老桥能提供的信息。A 说出它们反映古人的生活；B 说材料；C 说保护规则；D 说新桥，都没有回答「告诉我们什么」。","answer_cn_hint":"用 They can tell us… 说出老路老桥背后的故事，比如古人怎么出行。","options_cn":["它们能告诉我们很久以前的人们是怎么生活、怎么出行的。","老桥是用石头或木头造的。","我们不应该在老墙上写字。","我的家乡在河上有一座新桥。"]}]},{"id":"w8-mon-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"horse","phonetic":"/hɔːs/","meaning":"马","emoji":"🐴","example_en":"The trader put the tea bags on his horse.","example_cn":"商人把茶包放到牲口的背上，出发翻过高地。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🧺","🐴","🛤️","🌉"],"answer":1},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["⛰️","🛤️","🐴","🧺"],"answer":2},{"type":"meaning_choice","prompt":"horse 是什么意思？（1/2）","options":["马","山；高山","小路；小径","桥梁"],"answer":0},{"type":"meaning_choice","prompt":"horse 是什么意思？（2/2）","options":["篮子；筐","山；高山","小路；小径","马"],"answer":3},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: h__se","answer":"or"}],"letters":["h","o","r","s","e"],"syllables":["horse"],"hint_cn":"会跑会驮东西的大动物，古时候当车用"},{"word":"mountain","phonetic":"/ˈmaʊntən/","meaning":"山；高山","emoji":"⛰️","example_en":"The Tea Horse Road goes over tall mountains.","example_cn":"茶马古道从高高的岭上翻过去。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🛤️","🐴","⛰️","🌉"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🧺","🐴","⛰️","🛤️"],"answer":2},{"type":"meaning_choice","prompt":"mountain 是什么意思？（1/2）","options":["马","桥梁","篮子；筐","山；高山"],"answer":3},{"type":"meaning_choice","prompt":"mountain 是什么意思？（2/2）","options":["马","桥梁","篮子；筐","山；高山"],"answer":3},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: mou__ain","answer":"nt"}],"letters":["m","o","u","n","t","a","i","n"],"syllables":["moun","tain"],"hint_cn":"茶马古道要翻的高地，比小丘高得多"},{"word":"path","phonetic":"/pɑːθ/","meaning":"小路；小径","emoji":"🛤️","example_en":"The old stone path is narrow but still strong.","example_cn":"这条老石板小路很窄，但依然结实。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🛤️","🌉","🧺","⛰️"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🌉","🐴","🛤️","🧺"],"answer":2},{"type":"meaning_choice","prompt":"path 是什么意思？（1/2）","options":["马","篮子；筐","小路；小径","山；高山"],"answer":2},{"type":"meaning_choice","prompt":"path 是什么意思？（2/2）","options":["小路；小径","山；高山","篮子；筐","马"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: p__h","answer":"at"}],"letters":["p","a","t","h"],"syllables":["path"],"hint_cn":"人走出来的窄窄的路，th 咬舌"},{"word":"bridge","phonetic":"/brɪdʒ/","meaning":"桥梁","emoji":"🌉","example_en":"We crossed the river on an old stone bridge.","example_cn":"河上那座古老的桥梁是用石头造的。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🌉","🧺","⛰️","🛤️"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🌉","🛤️","⛰️","🐴"],"answer":0},{"type":"meaning_choice","prompt":"bridge 是什么意思？（1/2）","options":["山；高山","篮子；筐","马","桥梁"],"answer":3},{"type":"meaning_choice","prompt":"bridge 是什么意思？（2/2）","options":["桥梁","山；高山","篮子；筐","小路；小径"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: br__ge","answer":"id"}],"letters":["b","r","i","d","g","e"],"syllables":["bridge"],"hint_cn":"架在河上让人走过去的东西"},{"word":"basket","phonetic":"/ˈbɑːskɪt/","meaning":"篮子；筐","emoji":"🧺","example_en":"Grandma carries vegetables in a big basket.","example_cn":"奶奶用一个大篮子装蔬菜。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🌉","🐴","🧺","⛰️"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["⛰️","🐴","🛤️","🧺"],"answer":3},{"type":"meaning_choice","prompt":"basket 是什么意思？（1/2）","options":["篮子；筐","小路；小径","桥梁","马"],"answer":0},{"type":"meaning_choice","prompt":"basket 是什么意思？（2/2）","options":["马","山；高山","篮子；筐","桥梁"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: ba__et","answer":"sk"}],"letters":["b","a","s","k","e","t"],"syllables":["bas","ket"],"hint_cn":"竹子或藤条编的，能装东西"}]},{"id":"w8-mon-reading","name_cn":"阅读理解 · 茶马古道","type":"reading","duration":10,"passage":"The Tea Horse Road was an old trade path between Yunnan and Tibet. Long ago, people loaded tea onto horses and walked over the tall mountains for many months. The road was narrow and dangerous, so the traders walked in groups and camped at night. They carried salt and cloth on the way back, and traded them for more tea. Today people can still see old stone paths and horse bells in the small towns along the road. My grandfather says the road tells us how hard our great-grandparents worked.","passage_cn":"茶马古道是云南和西藏之间一条古老的商路。很久以前，人们把茶叶装上马背，翻越高高的群山，一走就是好几个月。这条路又窄又危险，所以商队结伴而行，晚上扎营休息。他们在回程时带上盐和布匹，用它们换更多的茶叶。今天，在古道沿线的小镇上，人们还能看到老石板路和马的铃铛。我爷爷说，这条路告诉我们，我们的祖辈当年干活有多辛苦。","questions":[{"id":"w8-mon-rd1","type":"choice","question":"What did people load onto the horses long ago?","options":["Tea","Salt and cloth","Stones","Fruit"],"answer":0,"explanation_cn":"第二句说 people loaded tea onto horses（把茶装上马背）；盐和布是回程才带的。"},{"id":"w8-mon-rd2","type":"choice","question":"Where was the Tea Horse Road?","options":["Between Yunnan and Tibet","Between Beijing and Shanghai","Between two rivers","Between two big cities"],"answer":0,"explanation_cn":"第一句写 between Yunnan and Tibet（云南和西藏之间），其他三项文中没提。"},{"id":"w8-mon-rd3","type":"choice","question":"What did the traders carry on the way back?","options":["Salt and cloth","Tea and sugar","Books and maps","Rice and eggs"],"answer":0,"explanation_cn":"第四句说 carried salt and cloth on the way back（回程带盐和布）。"},{"id":"w8-mon-rd4","type":"choice","question":"What can people still see along the road today?","options":["Old stone paths and horse bells","New hotels and shops","Big trucks and buses","Modern trains"],"answer":0,"explanation_cn":"第五句写 old stone paths and horse bells（老石板路和马的铃铛），其他三项文中没提。"}]},{"id":"w8-mon-kb","name_cn":"今天学的词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w8-mon-kb1","type":"fill","question":"马：h___ [填完整单词]","answer":"horse","explanation_cn":"horse 读 /hɔːs/，古时候马是最重要的运输帮手。"},{"id":"w8-mon-kb2","type":"fill","question":"山；高山：m________ [填完整单词]","answer":"mountain","explanation_cn":"moun + tain；茶马古道翻过高高的 mountains。"},{"id":"w8-mon-kb3","type":"fill","question":"桥梁：b_____ [填完整单词]","answer":"bridge","explanation_cn":"bridge 读 /brɪdʒ/，结尾是 dge。"},{"id":"w8-mon-kb4","type":"fill","question":"篮子；筐：b_____ [填完整单词]","answer":"basket","explanation_cn":"bas + ket；篮球 basketball 就是 basket + ball。"}]}]},{"day_cn":"周二","day_en":"Tuesday","is_speaking_day":false,"total_duration":31,"theme_cn":"阅读理解（垃圾分类） + will/won't 语法 + 听力 + 键盘拼写","modules":[{"id":"w8-tue-reading","name_cn":"阅读理解 · 垃圾分类","type":"reading","duration":10,"passage":"In big cities like Shanghai, families sort their rubbish into four different bins every day. The blue bin takes paper, plastic bottles and glass, and the green bin takes fruit skins and leaves. The red bin is for things like old batteries, because they are bad for the earth. The grey bin takes other rubbish, such as used tissues and dirty paper cups. At my school, the students take turns to help younger kids sort their rubbish at lunch. Sorting rubbish keeps our city clean and gives old things a new life.","passage_cn":"在上海这样的大城市，每个家庭每天都要把垃圾分进四种不同的垃圾桶。蓝色垃圾桶收纸张、塑料瓶和玻璃，绿色垃圾桶收果皮和树叶。红色垃圾桶收旧电池这类东西，因为它们对地球有害。灰色垃圾桶收其他垃圾，比如用过的纸巾和脏纸杯。在我的学校，同学们中午轮流帮助低年级的小朋友给垃圾分类。垃圾分类让我们的城市保持干净，也让旧东西有了新的生命。","questions":[{"id":"w8-tue-rd1","type":"choice","question":"How many bins do families sort rubbish into?","options":["Four","Two","Six","One"],"answer":0,"explanation_cn":"第一句说 four different bins（四种不同的垃圾桶）。"},{"id":"w8-tue-rd2","type":"choice","question":"What goes into the blue bin?","options":["Paper, plastic bottles and glass","Fruit skins and leaves","Old batteries","Used tissues"],"answer":0,"explanation_cn":"第二句说 blue bin 收 paper、plastic bottles 和 glass；果皮树叶进绿色桶。"},{"id":"w8-tue-rd3","type":"choice","question":"Why do old batteries go into the red bin?","options":["Because they are bad for the earth","Because they are very heavy","Because they are big","Because they smell bad"],"answer":0,"explanation_cn":"第三句写 because they are bad for the earth（因为它们对地球有害）。"},{"id":"w8-tue-rd4","type":"choice","question":"What do the students take turns to do at lunch?","options":["Help younger kids sort their rubbish","Clean the grey bin","Take the rubbish home","Make paper cups"],"answer":0,"explanation_cn":"第五句说 take turns to help younger kids sort their rubbish（轮流帮低年级小朋友分类）。"}]},{"id":"w8-tue-grammar","name_cn":"语法 · will / won't（一般将来时）","type":"grammar","duration":10,"questions":[{"id":"w8-tue-gr1","type":"fill","question":"选词填空（will / won't）：Tomorrow is my birthday, so Mum ___ make a big cake for me.","answer":"will","explanation_cn":"明天确实会发生的事用 will；肯定句直接敲小写 will。"},{"id":"w8-tue-gr2","type":"fill","question":"选词填空（will / won't）：Don't worry about that little dog; it ___ bite you.","answer":"won't","explanation_cn":"不会发生的用 won't = will not；小狗不会咬人。"},{"id":"w8-tue-gr3","type":"fill","question":"选词填空（will / won't）：Look at the black clouds! It ___ rain in a minute.","answer":"will","explanation_cn":"看到乌云推断马上要下雨，用 will 表示将要发生。"},{"id":"w8-tue-gr4","type":"fill","question":"选词填空（will / won't）：Lily is ill today, so she ___ come to school tomorrow.","answer":"won't","explanation_cn":"生病了所以明天不会来上学，用否定式 won't。"},{"id":"w8-tue-gr5","type":"fill","question":"选词填空（will / won't）：There ___ be a football game in our school next Friday.","answer":"will","explanation_cn":"There will be… 是固定句型，表示「下周将会有……」。"},{"id":"w8-tue-gr6","type":"fill","question":"选词填空（will / won't）：Practice more and you ___ swim better next month.","answer":"will","explanation_cn":"多练习，下个月你「就会」游得更好，肯定的意思用 will。"}]},{"id":"w8-tue-listening","name_cn":"听力 · 垃圾分类站","type":"listening","duration":5,"questions":[{"id":"w8-tue-ls1","type":"choice","question":"Listen to the dialogue. Where should the boy put the bottles?","audio_text":"Mum: We have two bottles and some old paper here. Boy: Shall I put them into the blue bin? Mum: Yes, and the fruit skins go into the green one.","options":["Into the blue bin","Into the green bin","Into the red bin","Into the grey bin"],"answer":0,"explanation_cn":"男孩问能不能放进蓝桶，妈妈说 Yes，所以瓶子进 blue bin。"},{"id":"w8-tue-ls2","type":"choice","question":"Listen to the dialogue. How can the woman get to the rubbish station?","audio_text":"Woman: Excuse me, where is the nearest rubbish station? Man: Go along this street and turn left at the fruit shop. Woman: Thank you very much.","options":["Turn left at the fruit shop","Turn right at the school","Go back home first","Take a bus there"],"answer":0,"explanation_cn":"男士说 Go along this street and turn left at the fruit shop（沿这条街走，在水果店左转）。"},{"id":"w8-tue-ls3","type":"choice","question":"Which picture matches the sentence you hear?","audio_text":"The boy is putting a plastic bottle into the blue bin.","options":["🗑️","📰","🍎","🚲"],"picture_options":true,"answer":0,"explanation_cn":"句子里说 putting a plastic bottle into the blue bin（把塑料瓶放进蓝色垃圾桶），所以选垃圾桶 🗑️。"},{"id":"w8-tue-ls4","type":"fill","question":"Listen and fill in the blank: Please sort the rubbish and keep our city ___.","audio_text":"Please sort the rubbish and keep our city clean.","answer":"clean","explanation_cn":"听到 keep our city clean（让我们的城市保持干净），所以填 clean。"}]},{"id":"w8-tue-kb","name_cn":"今天学的词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w8-tue-kb1","type":"fill","question":"分类；整理：s___ [填完整单词]","answer":"sort","explanation_cn":"sort rubbish 给垃圾分类；sort 也指「种类」，a kind of sort。"},{"id":"w8-tue-kb2","type":"fill","question":"垃圾桶：b__ [填完整单词]","answer":"bin","explanation_cn":"bin 就是垃圾桶，四个字母的单词最好记。"},{"id":"w8-tue-kb3","type":"fill","question":"塑料的：p_______ [填完整单词]","answer":"plastic","explanation_cn":"plas + tic；plastic bottles 塑料瓶，少用塑料袋就是 plastic bags。"},{"id":"w8-tue-kb4","type":"fill","question":"玻璃：g____ [填完整单词]","answer":"glass","explanation_cn":"glass 玻璃；一杯玻璃杯装的水是 a glass of water。"}]}]},{"day_cn":"周三","day_en":"Wednesday","is_speaking_day":true,"total_duration":51,"theme_cn":"AI口语 + 高频词汇 + 阅读理解（极地科考） + 键盘拼写","modules":[{"id":"w8-wed-speaking","name_cn":"AI口语练习","type":"speaking","duration":30,"questions":[{"id":"w8-wed-sp1","type":"choice","sentence":"Would you like to visit the South Pole? Why or why not?","sentence_cn":"你想去南极看看吗？为什么？","options":["Yes, I would love to see the penguins and the ice there.","The South Pole is at the bottom of the earth.","I watch animal videos on my phone.","Penguins can swim very fast."],"answer":0,"pronunciation_tips":"would love to 连读，penguins /ˈpeŋɡwɪnz/ 词尾 s 别丢，ice 读长音 /aɪs/","explanation_cn":"问想不想去 + 为什么，答句要先表态再给理由。A 有 Yes 和理由；B、D 是常识介绍；C 说的是看视频，都没回答「想不想去」。","answer_cn_hint":"先说 Yes 或 No，再用 because 说想去或不想去的原因。","options_cn":["想，我很想看看那里的企鹅和冰雪。","南极在地球的最南端。","我用手机看动物视频。","企鹅游泳游得很快。"]},{"id":"w8-wed-sp2","type":"choice","sentence":"What animals can live in very cold places?","sentence_cn":"什么动物能住在特别冷的地方？","options":["Penguins and polar bears can live in very cold places.","Cats like to sleep in warm rooms.","Fish live in rivers and seas.","My dog likes playing with a ball."],"answer":0,"pronunciation_tips":"polar bears /ˈpəʊlə beəz/ 连读，cold /kəʊld/ 词尾 d 轻轻带过","explanation_cn":"What 问「哪种动物」，答句要直接点名动物。A 说出两种耐寒动物；B、C、D 说的是别的动物和习惯，都没有回答「冷地方的动物」。","answer_cn_hint":"直接说出企鹅、北极熊这样住在冰雪里的动物，再补一句它们不怕冷。","options_cn":["企鹅和北极熊能住在特别冷的地方。","猫喜欢睡在暖和的房间里。","鱼住在河里和海里。","我的狗喜欢玩球。"]},{"id":"w8-wed-sp3","type":"choice","sentence":"What should we wear in freezing weather?","sentence_cn":"在特别冷的天里我们应该穿什么？","options":["We should wear thick coats, warm hats and gloves.","The weather in winter is cold.","I like the colour of my new hat.","Some people go swimming in winter."],"answer":0,"pronunciation_tips":"freezing /ˈfriːzɪŋ/ 中间是长音 /iː/，gloves /ɡlʌvz/ 词尾 s 出声","explanation_cn":"should 问建议，答句要给出具体穿戴。A 说了外套、帽子、手套三样；B 说天气；C 说颜色；D 说别人的事，都没有回答「穿什么」。","answer_cn_hint":"用 We should wear… 说出厚外套、帽子、手套这些保暖的东西。","options_cn":["我们应该穿厚外套，戴暖和的帽子和手套。","冬天的天气很冷。","我喜欢我新帽子的颜色。","有些人冬天去游泳。"]},{"id":"w8-wed-sp4","type":"choice","sentence":"Why do scientists go to the South Pole?","sentence_cn":"科学家为什么要去南极？","options":["They go there to study the weather, the ice and the animals.","The South Pole is far away from China.","Scientists work in labs every day.","It is fun to play with snow."],"answer":0,"pronunciation_tips":"scientists /ˈsaɪəntɪsts/ 词尾 ts 要出声，weather /ˈweðə/ 中间是浊音","explanation_cn":"Why 问目的，答句要用 to do 或 because 说原因。A 说出研究内容；B 说距离；C 说日常工作；D 说玩雪，都不是「去南极的原因」。","answer_cn_hint":"用 They go there to… 说出研究的对象，比如天气、冰层和动物。","options_cn":["他们去那里研究天气、冰和动物。","南极离中国很远。","科学家每天在实验室工作。","玩雪很好玩。"]},{"id":"w8-wed-sp5","type":"choice","sentence":"How can we help animals in a cold winter?","sentence_cn":"寒冷的冬天我们能怎样帮助动物？","options":["We can leave some food and water outside for the birds and cats.","Animals sleep a lot in winter.","Winter is my favourite season.","There are many animals in the zoo."],"answer":0,"pronunciation_tips":"outside /ˌaʊtˈsaɪd/ 重音在后，water /ˈwɔːtə/ 美音里 t 读得像轻快的 d","explanation_cn":"How 问方法，答句要给具体做法。A 说了留食留水；B、C 说冬天；D 说动物园，都没有回答「怎么帮」。","answer_cn_hint":"用 We can + 动词原形，说出留食物、留水这样具体的小事。","options_cn":["我们可以在外面给鸟和猫留一些食物和水。","动物冬天睡得很多。","冬天是我最喜欢的季节。","动物园里有很多动物。"]}]},{"id":"w8-wed-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"penguin","phonetic":"/ˈpeŋɡwɪn/","meaning":"企鹅","emoji":"🐧","example_en":"The penguin walks like a little gentleman.","example_cn":"企鹅走起路来像一位小绅士。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🐧","🧊","🥶","🔦"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🐧","🔦","🧊","👩‍🔬"],"answer":0},{"type":"meaning_choice","prompt":"penguin 是什么意思？（1/2）","options":["科学家","极冷的；结冰的","企鹅","手电筒"],"answer":2},{"type":"meaning_choice","prompt":"penguin 是什么意思？（2/2）","options":["科学家","企鹅","极冷的；结冰的","冰山"],"answer":1},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: pe__uin","answer":"ng"}],"letters":["p","e","n","g","u","i","n"],"syllables":["pen","guin"],"hint_cn":"黑白羽毛、走路摇摇摆摆的南极鸟"},{"word":"iceberg","phonetic":"/ˈaɪsbɜːɡ/","meaning":"冰山","emoji":"🧊","example_en":"The big ship must turn away from the iceberg.","example_cn":"大船必须转向，避开那座冰山。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🧊","👩‍🔬","🐧","🔦"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🐧","🥶","🧊","🔦"],"answer":2},{"type":"meaning_choice","prompt":"iceberg 是什么意思？（1/2）","options":["手电筒","科学家","极冷的；结冰的","冰山"],"answer":3},{"type":"meaning_choice","prompt":"iceberg 是什么意思？（2/2）","options":["极冷的；结冰的","冰山","手电筒","企鹅"],"answer":1},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: ic__erg","answer":"eb"}],"letters":["i","c","e","b","e","r","g"],"syllables":["ice","berg"],"hint_cn":"ice + berg，漂在海里的大冰块"},{"word":"scientist","phonetic":"/ˈsaɪəntɪst/","meaning":"科学家","emoji":"👩‍🔬","example_en":"The scientist studies the ice at the South Pole.","example_cn":"这位科学家研究南极的冰。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🔦","🧊","👩‍🔬","🥶"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🧊","🐧","🔦","👩‍🔬"],"answer":3},{"type":"meaning_choice","prompt":"scientist 是什么意思？（1/2）","options":["科学家","冰山","手电筒","极冷的；结冰的"],"answer":0},{"type":"meaning_choice","prompt":"scientist 是什么意思？（2/2）","options":["科学家","手电筒","企鹅","冰山"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: sci__tist","answer":"en"}],"letters":["s","c","i","e","n","t","i","s","t"],"syllables":["sci","en","tist"],"hint_cn":"做研究、做实验、找答案的人"},{"word":"freezing","phonetic":"/ˈfriːzɪŋ/","meaning":"极冷的；结冰的","emoji":"🥶","example_en":"The wind at the South Pole is freezing cold.","example_cn":"南极的风冷得刺骨。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🐧","🧊","🥶","👩‍🔬"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["👩‍🔬","🧊","🔦","🥶"],"answer":3},{"type":"meaning_choice","prompt":"freezing 是什么意思？（1/2）","options":["科学家","冰山","极冷的；结冰的","企鹅"],"answer":2},{"type":"meaning_choice","prompt":"freezing 是什么意思？（2/2）","options":["企鹅","科学家","极冷的；结冰的","手电筒"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: fre__ing","answer":"ez"}],"letters":["f","r","e","e","z","i","n","g"],"syllables":["freez","ing"],"hint_cn":"freeze 加 ing，冷得水都结冰了"},{"word":"torch","phonetic":"/tɔːtʃ/","meaning":"手电筒","emoji":"🔦","example_en":"The scientists use a torch in the dark night.","example_cn":"科学家在漆黑的夜里用手电筒。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🥶","🧊","🔦","🐧"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🔦","🐧","🧊","🥶"],"answer":0},{"type":"meaning_choice","prompt":"torch 是什么意思？（1/2）","options":["极冷的；结冰的","手电筒","科学家","企鹅"],"answer":1},{"type":"meaning_choice","prompt":"torch 是什么意思？（2/2）","options":["手电筒","极冷的；结冰的","冰山","企鹅"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: t__ch","answer":"or"}],"letters":["t","o","r","c","h"],"syllables":["torch"],"hint_cn":"黑夜照亮的手里的小灯，ch 结尾"}]},{"id":"w8-wed-reading","name_cn":"阅读理解 · 极地科考","type":"reading","duration":10,"passage":"Every year, Chinese scientists travel to the South Pole on a big icebreaker called Xuelong, which means snow dragon. The ship is one hundred and sixty-seven metres long, and its strong body can break thick ice on the way. The scientists study the weather, the ice and the animals there, because the South Pole tells us a lot about the earth. It is freezing cold, and in winter the sun does not come up for many weeks. The scientists wear thick coats and use torches to see in the dark nights. Penguins often stand near their camp, and they are not afraid of people at all.","passage_cn":"每年，中国的科学家都会乘坐名字意思是雪做龙的「雪龙号」大破冰船去南极。这条船有一百六十七米长，结实的船身能一路上撞开厚厚的冰。科学家们在那里研究天气、冰和动物，因为南极能告诉我们很多关于地球的事。那里冷得刺骨，冬天太阳好几个星期都不升起。科学家们穿着厚外套，用上手电筒，才能在漆黑的夜里看清东西。企鹅常常站在营地旁边，它们一点儿也不怕人。","questions":[{"id":"w8-wed-rd1","type":"choice","question":"What does the name Xuelong mean?","options":["Snow dragon","Ice ship","Cold wind","White bear"],"answer":0,"explanation_cn":"第一句写 which means snow dragon（意思是雪做的龙）。"},{"id":"w8-wed-rd2","type":"choice","question":"Why do scientists go to the South Pole?","options":["To study the weather, the ice and the animals","To visit penguin zoos","To catch fish for dinner","To build a big city"],"answer":0,"explanation_cn":"第三句说 study the weather, the ice and the animals（研究天气、冰和动物）。"},{"id":"w8-wed-rd3","type":"choice","question":"What do the scientists use to see in the dark nights?","options":["Torches","Telephones","Cameras","Maps"],"answer":0,"explanation_cn":"第五句写 use torches to see in the dark nights（用手电筒在黑夜里看东西）。"},{"id":"w8-wed-rd4","type":"choice","question":"Which animal often stands near the camp?","options":["Penguins","Polar bears","Horses","Dogs"],"answer":0,"explanation_cn":"最后一句说 Penguins often stand near their camp（企鹅常站在营地旁）。"}]},{"id":"w8-wed-kb","name_cn":"今天学的词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w8-wed-kb1","type":"fill","question":"企鹅：p_______ [填完整单词]","answer":"penguin","explanation_cn":"pen + guin；企鹅走路摇摇摆摆的，特别好认。"},{"id":"w8-wed-kb2","type":"fill","question":"冰山：i______ [填完整单词]","answer":"iceberg","explanation_cn":"ice + berg；海里漂着的大冰块就是冰山。"},{"id":"w8-wed-kb3","type":"fill","question":"科学家：s_________ [填完整单词]","answer":"scientist","explanation_cn":"science 去 e 加 tist；注意开头的 sc。"},{"id":"w8-wed-kb4","type":"fill","question":"手电筒：t____ [填完整单词]","answer":"torch","explanation_cn":"torch 读 /tɔːtʃ/，结尾是 tch，火把也是这个词。"}]}]},{"day_cn":"周四","day_en":"Thursday","is_speaking_day":false,"total_duration":31,"theme_cn":"阅读理解（机器人快递） + 比较级语法 + 听力 + 键盘拼写","modules":[{"id":"w8-thu-reading","name_cn":"阅读理解 · 机器人快递","type":"reading","duration":10,"passage":"In some Chinese cities, little robots now help people send packages. The robot looks like a small box with six wheels, and it can carry up to thirty kilograms. Before it starts, you put your package in and tell the robot your home address on the phone. The robot has eyes on top, so it can stop and wait when people or bikes pass by. When it arrives, you type a code on the screen and the door opens by itself. Many people like it because it works day and night and never gets tired.","passage_cn":"在中国的一些城市，小机器人现在帮人们送快递。这种机器人看起来像一个带六个轮子的小箱子，最多能装三十公斤的东西。出发之前，你把包裹放进去，在手机上告诉机器人你家的地址。机器人的顶上有「眼睛」，所以有人或者自行车经过时，它会停下来等一等。到了之后，你在屏幕上输入取件码，门就会自己打开。很多人喜欢它，因为它白天黑夜都能干活，而且从来不会累。","questions":[{"id":"w8-thu-rd1","type":"choice","question":"What does the delivery robot look like?","options":["A small box with six wheels","A big dog with four legs","A tall man with a bag","A bird with two wings"],"answer":0,"explanation_cn":"第二句说 looks like a small box with six wheels（像带六个轮子的小箱子）。"},{"id":"w8-thu-rd2","type":"choice","question":"How much can the robot carry?","options":["Up to thirty kilograms","Up to three kilograms","Only one book","One hundred kilograms"],"answer":0,"explanation_cn":"第二句写 carry up to thirty kilograms（最多装三十公斤）。"},{"id":"w8-thu-rd3","type":"choice","question":"What does the robot do when people or bikes pass by?","options":["It stops and waits","It runs faster","It turns around","It makes a loud noise"],"answer":0,"explanation_cn":"第四句说 it can stop and wait when people or bikes pass by（停下来等）。"},{"id":"w8-thu-rd4","type":"choice","question":"How do you open the robot's door?","options":["Type a code on the screen","Push it hard","Ask the robot loudly","Wait for ten minutes"],"answer":0,"explanation_cn":"第五句写 type a code on the screen and the door opens（在屏幕上输入取件码，门就开）。"}]},{"id":"w8-thu-grammar","name_cn":"语法 · 比较级","type":"grammar","duration":10,"questions":[{"id":"w8-thu-gr1","type":"fill","question":"选词填空（bigger / hotter / heavier / faster / funnier / colder）：The elephant is ___ than the horse.","answer":"bigger","explanation_cn":"大象比马大，big 双写 g 加 er。"},{"id":"w8-thu-gr2","type":"fill","question":"选词填空（bigger / hotter / heavier / faster / funnier / colder）：Today is ___ than yesterday, so we all wear short sleeves.","answer":"hotter","explanation_cn":"今天比昨天热，hot 双写 t 加 er。"},{"id":"w8-thu-gr3","type":"fill","question":"选词填空（bigger / hotter / heavier / faster / funnier / colder）：My schoolbag is ___ than yours; yours is light.","answer":"heavier","explanation_cn":"我的书包比你的重，heavy 去 y 加 ier。"},{"id":"w8-thu-gr4","type":"fill","question":"选词填空（bigger / hotter / heavier / faster / funnier / colder）：The delivery robot runs ___ than a walking man.","answer":"faster","explanation_cn":"fast 加 er；机器人跑得比走路的人快。"},{"id":"w8-thu-gr5","type":"fill","question":"选词填空（bigger / hotter / heavier / faster / funnier / colder）：This cartoon is ___ than that one, so we all laugh.","answer":"funnier","explanation_cn":"funny 去 y 加 ier；这部动画片更好笑，大家都笑了。"},{"id":"w8-thu-gr6","type":"fill","question":"选词填空（bigger / hotter / heavier / faster / funnier / colder）：Winter in Beijing is ___ than in Shanghai.","answer":"colder","explanation_cn":"北京的冬天比上海冷，cold 加 er。"}]},{"id":"w8-thu-listening","name_cn":"听力 · 快递到门","type":"listening","duration":5,"questions":[{"id":"w8-thu-ls1","type":"choice","question":"Listen to the dialogue. What is inside the package?","audio_text":"Boy: Mum, the robot is at our door with a package. Mum: OK, let me type the code and open it. Boy: Look, my new storybooks are inside!","options":["New storybooks","New shoes","A birthday cake","A toy car"],"answer":0,"explanation_cn":"男孩最后说 my new storybooks are inside（我的新故事书在里面）。"},{"id":"w8-thu-ls2","type":"choice","question":"Listen to the dialogue. Where should the man leave the package?","audio_text":"Man: Hello, where should I leave the package today? Woman: Please put it at the front desk, and my son will take it home. Man: No problem, I will send you a photo later.","options":["At the front desk","Under the bed","In the classroom","At the school gate"],"answer":0,"explanation_cn":"女士说 put it at the front desk（放在前台）。"},{"id":"w8-thu-ls3","type":"choice","question":"Which picture matches the sentence you hear?","audio_text":"A little robot is carrying a big package on the street.","options":["🤖","🚲","🐕","🚌"],"picture_options":true,"answer":0,"explanation_cn":"句子里说 a little robot is carrying a big package（小机器人扛着大包裹），所以选 🤖。"},{"id":"w8-thu-ls4","type":"fill","question":"Listen and fill in the blank: The robot has ___ wheels, so it can turn easily.","audio_text":"The robot has six wheels, so it can turn easily.","answer":"six","explanation_cn":"听到 six wheels（六个轮子），所以填 six。"}]},{"id":"w8-thu-kb","name_cn":"今天学的词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w8-thu-kb1","type":"fill","question":"机器人：r____ [填完整单词]","answer":"robot","explanation_cn":"ro + bot；机器人是今天阅读的主角。"},{"id":"w8-thu-kb2","type":"fill","question":"包裹：p_____ [填完整单词]","answer":"parcel","explanation_cn":"parcel 和 package 都指包裹，ce 结尾别写成 se。"},{"id":"w8-thu-kb3","type":"fill","question":"重的：h____ [填完整单词]","answer":"heavy","explanation_cn":"heavy 读 /ˈhevi/；比较级是 heavier。"},{"id":"w8-thu-kb4","type":"fill","question":"街道：s_____ [填完整单词]","answer":"street","explanation_cn":"street 读 /striːt/，双 ee 长音；马路上走的是 street。"}]}]},{"day_cn":"周五","day_en":"Friday","is_speaking_day":false,"total_duration":46,"theme_cn":"疑问词语法 + 听力 + KET词汇 + 写作（机器人模型邀请信） + 键盘拼写","modules":[{"id":"w8-fri-grammar","name_cn":"语法 · 疑问词","type":"grammar","duration":10,"questions":[{"id":"w8-fri-gr1","type":"fill","question":"选词填空（what / where / when / why / how / who / whose）：___ do you go to school every day? By bike.","answer":"how","explanation_cn":"答句 By bike 说的是方式，问方式用 how。"},{"id":"w8-fri-gr2","type":"fill","question":"选词填空（what / where / when / why / how / who / whose）：___ is your English teacher? Miss Wang.","answer":"who","explanation_cn":"答句 Miss Wang 是人，问「谁」用 who。"},{"id":"w8-fri-gr3","type":"fill","question":"选词填空（what / where / when / why / how / who / whose）：___ do you like penguins? Because they are cute.","answer":"why","explanation_cn":"答句以 Because 开头，说明原因，问原因用 why。"},{"id":"w8-fri-gr4","type":"fill","question":"选词填空（what / where / when / why / how / who / whose）：___ schoolbag is this? It is mine.","answer":"whose","explanation_cn":"问「谁的书包」用 whose；who 问人，whose 问「谁的」。"},{"id":"w8-fri-gr5","type":"fill","question":"选词填空（what / where / when / why / how / who / whose）：___ does the museum open? At eight in the morning.","answer":"when","explanation_cn":"答句 At eight 是时间，问时间用 when。"},{"id":"w8-fri-gr6","type":"fill","question":"选词填空（what / where / when / why / how / who / whose）：___ is the science museum? Near the city park.","answer":"where","explanation_cn":"答句 Near the park 说的是地点，问地点用 where。"},{"id":"w8-fri-gr7","type":"fill","question":"选词填空（what / where / when / why / how / who / whose）：___ are you doing now? I am drawing a picture of the sea.","answer":"what","explanation_cn":"答句说正在做的事，问「在做什么」用 what。"}]},{"id":"w8-fri-listening","name_cn":"听力 · 电话邀约","type":"listening","duration":5,"questions":[{"id":"w8-fri-ls1","type":"choice","question":"Listen to the dialogue. What will the two friends do this Saturday?","audio_text":"Boy: Hello, Lily! Shall we build my new robot model this Saturday? Girl: Great idea! Can I bring my small tools? Boy: Of course, and Mum will make a birthday cake for us.","options":["Build a robot model","Go swimming","Do homework","Watch a film"],"answer":0,"explanation_cn":"男孩提议 build my new robot model（拼机器人模型），女孩说 Great idea。"},{"id":"w8-fri-ls2","type":"choice","question":"Listen to the dialogue. What time should Lily come on Saturday?","audio_text":"Girl: Dad, what time shall I go to Tom's home tomorrow? Dad: At nine in the morning, and I will take you there by bike. Girl: OK, I will take my small tools and a ball.","options":["At nine in the morning","At six in the evening","At twelve at noon","At eight at night"],"answer":0,"explanation_cn":"爸爸说 At nine in the morning（早上九点），还要骑车送她去。"},{"id":"w8-fri-ls3","type":"choice","question":"Which picture matches the sentence you hear?","audio_text":"It is my birthday today, and Mum made a big cake for me.","options":["🎂","🎁","🍉","🧸"],"picture_options":true,"answer":0,"explanation_cn":"句子里说 Mum made a big cake（妈妈做了大蛋糕），所以选蛋糕 🎂。"},{"id":"w8-fri-ls4","type":"fill","question":"Listen and fill in the blank: The robot model is my favourite birthday ___.","audio_text":"The robot model is my favourite birthday present.","answer":"present","explanation_cn":"听到 birthday present（生日礼物），所以填 present；这是上周学过的词，复习一遍。"}]},{"id":"w8-fri-ket_pet","name_cn":"KET/PET题型","type":"ket_pet","duration":10,"questions":[{"id":"w8-fri-kp1","type":"choice","question":"KET: My uncle works in a big factory ___ makes delivery robots.","options":["which","who","what","where"],"answer":0,"explanation_cn":"先行词 factory 是物，定语从句用 which；who 只能指人。"},{"id":"w8-fri-kp2","type":"choice","question":"KET: I look forward to ___ from you soon.","options":["hearing","hear","hears","listened"],"answer":0,"explanation_cn":"look forward to 里的 to 是介词，后面接动名词 hearing。"},{"id":"w8-fri-kp3","type":"choice","question":"KET: There ___ a robot show in the museum tonight.","options":["will be","will has","will have","is going"],"answer":0,"explanation_cn":"There will be… 是固定句型；there be 句型不能说 there will have。"},{"id":"w8-fri-kp4","type":"choice","question":"KET: The bus is coming. Let's ___ the bus quickly.","options":["get on","get up","get off","put on"],"answer":0,"explanation_cn":"上车是 get on；get up 起床，get off 下车，put on 穿上。"},{"id":"w8-fri-kp5","type":"choice","question":"KET: Could you tell me ___ to the science museum?","options":["the way","how way","way","to way"],"answer":0,"explanation_cn":"tell sb. the way to… 告诉某人去某地的路；the way 是固定说法。"}]},{"id":"w8-fri-writing","name_cn":"背诵作文 · 邀请朋友来拼机器人","type":"writing_template","duration":15,"title":"Dear Amy（四线三格作文 · 全文背默）","requirement_cn":"先把整封信大声读三遍，再把 5 个空填好，最后背诵全文。这封邀请信就是本周要背熟的作文！","keywords":["model","home","battery","box","nine"],"keywords_cn":["模型","家","电池","箱子","九点"],"template":"Dear Amy, Dad bought me a robot {{1}} for my birthday. Can you come to my {{2}} this Saturday? The robot cannot move without a new {{3}}, so we will put it in first. Then we can put all the small parts back into the {{4}} after we finish. Please come at {{5}} o'clock in the morning! Lily","blanks":[{"id":1,"hint_cn":"模型","hint_en":"model","answer":"model"},{"id":2,"hint_cn":"家","hint_en":"home","answer":"home"},{"id":3,"hint_cn":"电池","hint_en":"battery","answer":"battery"},{"id":4,"hint_cn":"箱子","hint_en":"box","answer":"box"},{"id":5,"hint_cn":"九点","hint_en":"nine","answer":"nine"}],"full_text":"Dear Amy, Dad bought me a robot model for my birthday. Can you come to my home this Saturday? The robot cannot move without a new battery, so we will put it in first. Then we can put all the small parts back into the box after we finish. Please come at nine o'clock in the morning! Lily","full_text_cn":"亲爱的Amy，爸爸给我买了一个机器人模型作为生日礼物。这个星期六你能来我家吗？机器人没有新电池就动不了，所以我们要先把它装上。拼完以后，我们可以把小零件全部收回箱子里。请早上九点来！莉莉","explanation_cn":"英文邀请信三要素：称呼 Dear Amy 开头、正文说清「请谁、什么时候、来做什么」、结尾用 Please come… 加署名。robot model 机器人模型；without a new battery 没有新电池；put … back into the box 把……放回箱子；at nine o'clock 在九点钟（时刻用 at）。","explanation_en":"An invitation note needs a greeting (Dear Amy), the plan (when, where, what to do), and a closing (Please come at nine!) with the name Lily."},{"id":"w8-fri-kb","name_cn":"今天的重点词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w8-fri-kb1","type":"fill","question":"模型：m____ [填完整单词]","answer":"model","explanation_cn":"robot model 机器人模型；model 也指「榜样」，role model 好榜样。"},{"id":"w8-fri-kb2","type":"fill","question":"家：h___ [填完整单词]","answer":"home","explanation_cn":"come to my home 来我家；home 也可以说 at home 在家。"},{"id":"w8-fri-kb3","type":"fill","question":"电池：b______ [填完整单词]","answer":"battery","explanation_cn":"bat + tery；机器人没有 battery 就动不了。"},{"id":"w8-fri-kb4","type":"fill","question":"箱子；盒子：b__ [填完整单词]","answer":"box","explanation_cn":"box 箱子；拼完机器人把零件放回 box 里。"}]}]},{"day_cn":"周六","day_en":"Saturday","is_speaking_day":true,"total_duration":51,"theme_cn":"AI口语 + 高频词汇 + 阅读理解（深海探测） + 键盘拼写","modules":[{"id":"w8-sat-speaking","name_cn":"AI口语练习","type":"speaking","duration":30,"questions":[{"id":"w8-sat-sp1","type":"choice","sentence":"What sea animals do you like best? Why?","sentence_cn":"你最喜欢哪种海洋动物？为什么？","options":["I like whales best, because they are the biggest animals in the sea.","Whales live in the ocean.","The sea is very big and deep.","I saw fish at the aquarium last year."],"answer":0,"pronunciation_tips":"whales /weɪlz/ 的 w 不发音，biggest 双写 g，ocean /ˈəʊʃn/ 读两个字","explanation_cn":"问最喜欢哪种 + 为什么，答句要选一种并给理由。A 点名鲸鱼并说明原因；B 只是介绍；C 说海；D 讲经历，都没有回答「最喜欢什么」。","answer_cn_hint":"先说 I like … best，再用 because 说一条理由，比如最大、最聪明。","options_cn":["我最喜欢鲸鱼，因为它们是海里最大的动物。","鲸鱼住在大海里。","大海又大又深。","去年我在海洋馆看过鱼。"]},{"id":"w8-sat-sp2","type":"choice","sentence":"Would you like to dive under the sea? Why or why not?","sentence_cn":"你想潜到海面下去看看吗？为什么？","options":["Yes, I would love to see the colourful coral and the little fish.","Divers need to learn swimming first.","The sea water is salty.","My cousin can swim very well."],"answer":0,"pronunciation_tips":"dive /daɪv/ 长音，coral /ˈkɒrəl/ 两个字，colourful 重音在最前","explanation_cn":"问想不想 + 为什么，答句先表态再给理由。A 有 Yes 和想看的东西；B、D 说别人；C 说海水，都没有正面回答。","answer_cn_hint":"先说 Yes 或 No，再用 because 说想看什么、或者怕什么。","options_cn":["想，我很想看看五颜六色的珊瑚和小鱼。","潜水员要先学会游泳。","海水是咸的。","我表哥游泳游得很好。"]},{"id":"w8-sat-sp3","type":"choice","sentence":"What can we do to keep the sea clean?","sentence_cn":"我们能做些什么让大海保持干净？","options":["We can stop throwing plastic bottles into the sea and join beach clean-up days.","The sea is blue and beautiful.","Many ships sail on the sea.","Fish need water to live."],"answer":0,"pronunciation_tips":"throwing /ˈfrəʊɪŋ/ 的 th 咬舌，clean-up 连读，beach 与 bitch 音要分清","explanation_cn":"How 问方法，答句要给具体做法。A 给了两条；B 是描写；C 说船；D 说鱼，都没有回答「怎么做」。","answer_cn_hint":"用 We can + 动词原形说出具体的事，比如不扔垃圾、捡沙滩上的塑料瓶。","options_cn":["我们可以不往海里扔塑料瓶，还可以参加海滩清洁日活动。","大海是蓝色的，很美。","很多船在海面上航行。","鱼儿靠水才能活。"]},{"id":"w8-sat-sp4","type":"choice","sentence":"If you could take a deep-sea ship, what would you want to see?","sentence_cn":"如果你能坐深海潜水器，你想看什么？","options":["I would want to see the strange fish that glow in the dark water.","Deep-sea ships are very expensive.","I took a ship to Dalian last summer.","The sea is home to many animals."],"answer":0,"pronunciation_tips":"strange /streɪndʒ/ 词尾 /dʒ/，glow 读 /ɡləʊ/，dark 词尾 r 卷舌","explanation_cn":"假设句用 I would want to… 回答。A 说出想看的东西；B 说价格；C 讲过去的经历；D 介绍大海，都没回答「想看什么」。","answer_cn_hint":"用 I would want to see… 说出深海里你最想看的东西，比如发光的鱼、珊瑚。","options_cn":["我想看在黑暗的海水里发光的怪鱼。","深海潜水器非常贵。","去年夏天我坐船去了大连。","大海是很多动物的家园。"]},{"id":"w8-sat-sp5","type":"choice","sentence":"Why is the deep sea hard to visit?","sentence_cn":"为什么深海很难到达？","options":["Because the water there presses down with a very heavy weight, and it is completely dark.","Because ships are too small for children.","Because the sea is far from my city.","Because fish swim very fast."],"answer":0,"pronunciation_tips":"presses /ˈpresɪz/ 词尾 /ɪz/，weight 与 wait 同音，completely 重音在第二音节","explanation_cn":"Why 问原因，答句要用 Because 说清楚。A 说了水压大和黑暗两个原因；B、C、D 都不是深海难到的真正原因。","answer_cn_hint":"用 Because 说出水压大、没有光这两个困难。","options_cn":["因为那里的海水压下来特别重，而且一片漆黑。","因为船对小朋友来说太小了。","因为大海离我的城市很远。","因为鱼游得很快。"]}]},{"id":"w8-sat-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"ocean","phonetic":"/ˈəʊʃn/","meaning":"海洋","emoji":"🌊","example_en":"The ocean covers most of the earth.","example_cn":"海洋覆盖了地球的大部分。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🦑","🤿","🌊","🪸"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🌊","🐳","🦑","🪸"],"answer":0},{"type":"meaning_choice","prompt":"ocean 是什么意思？（1/2）","options":["海洋","生物；动物","珊瑚","鲸鱼"],"answer":0},{"type":"meaning_choice","prompt":"ocean 是什么意思？（2/2）","options":["生物；动物","海洋","珊瑚","潜水员"],"answer":1},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: o__an","answer":"ce"}],"letters":["o","c","e","a","n"],"syllables":["o","cean"],"hint_cn":"比 sea 更大的那片蓝，四大洋的洋"},{"word":"diver","phonetic":"/ˈdaɪvə/","meaning":"潜水员","emoji":"🤿","example_en":"The diver swims with the fish under the sea.","example_cn":"潜水员和鱼群一起在海里游泳。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🤿","🪸","🦑","🌊"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🪸","🤿","🌊","🐳"],"answer":1},{"type":"meaning_choice","prompt":"diver 是什么意思？（1/2）","options":["潜水员","珊瑚","海洋","鲸鱼"],"answer":0},{"type":"meaning_choice","prompt":"diver 是什么意思？（2/2）","options":["潜水员","鲸鱼","海洋","生物；动物"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: d__er","answer":"iv"}],"letters":["d","i","v","e","r"],"syllables":["div","er"],"hint_cn":"dive 加 er，跳水潜水的人"},{"word":"coral","phonetic":"/ˈkɒrəl/","meaning":"珊瑚","emoji":"🪸","example_en":"The coral under the sea looks like a colourful garden.","example_cn":"海底的珊瑚看起来像一座彩色的花园。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🤿","🦑","🐳","🪸"],"answer":3},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🪸","🤿","🌊","🐳"],"answer":0},{"type":"meaning_choice","prompt":"coral 是什么意思？（1/2）","options":["潜水员","海洋","生物；动物","珊瑚"],"answer":3},{"type":"meaning_choice","prompt":"coral 是什么意思？（2/2）","options":["鲸鱼","海洋","珊瑚","生物；动物"],"answer":2},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: c__al","answer":"or"}],"letters":["c","o","r","a","l"],"syllables":["cor","al"],"hint_cn":"海底长着的五颜六色的小树林"},{"word":"creature","phonetic":"/ˈkriːtʃə/","meaning":"生物；动物","emoji":"🦑","example_en":"Strange creatures live in the deep cold water.","example_cn":"深海冷水里住着奇怪的生物。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🪸","🦑","🌊","🤿"],"answer":1},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🦑","🤿","🐳","🪸"],"answer":0},{"type":"meaning_choice","prompt":"creature 是什么意思？（1/2）","options":["生物；动物","海洋","鲸鱼","潜水员"],"answer":0},{"type":"meaning_choice","prompt":"creature 是什么意思？（2/2）","options":["潜水员","海洋","珊瑚","生物；动物"],"answer":3},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: cre__ure","answer":"at"}],"letters":["c","r","e","a","t","u","r","e"],"syllables":["crea","ture"],"hint_cn":"深海里游的奇怪活物，比如章鱼和水母"},{"word":"whale","phonetic":"/weɪl/","meaning":"鲸鱼","emoji":"🐳","example_en":"The whale is the biggest animal in the world.","example_cn":"鲸是世界上最大的动物。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🐳","🤿","🪸","🌊"],"answer":0},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🌊","🤿","🦑","🐳"],"answer":3},{"type":"meaning_choice","prompt":"whale 是什么意思？（1/2）","options":["珊瑚","海洋","潜水员","鲸鱼"],"answer":3},{"type":"meaning_choice","prompt":"whale 是什么意思？（2/2）","options":["鲸鱼","珊瑚","潜水员","生物；动物"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: w__le","answer":"ha"}],"letters":["w","h","a","l","e"],"syllables":["whale"],"hint_cn":"海里最大的哺乳动物，w 不发音"}]},{"id":"w8-sat-reading","name_cn":"阅读理解 · 深海探测","type":"reading","duration":10,"passage":"China's deep-sea ship Fendouzhe, which means striver, can dive more than ten thousand metres under the sea. In 2020, it carried three scientists down to the deepest place on the earth, the Mariana Trench. Down there, the water presses on the ship with a very heavy weight, like an elephant standing on a small table. The lights of the ship show us strange fish and soft coral that live in the dark cold water. Scientists take photos and bring back small samples to study. One day, maybe you will also take a ship and visit the deep blue sea.","passage_cn":"中国的深海潜水器「奋斗者号」名字的意思是努力奋斗的人，它能潜到海面下一万多米。2020 年，它载着三位科学家下到地球最深的地方——马里亚纳海沟。在那里，海水用非常大的重量压着潜水器，就像一头大象站在一张小桌上。潜水器的灯光让我们看到，黑暗冰冷的海水里住着奇怪的鱼和柔软的珊瑚。科学家们拍照，还带回小小的样本来研究。说不定有一天，你也能坐上潜水器，去看看深蓝色的大海。","questions":[{"id":"w8-sat-rd1","type":"choice","question":"What does the name Fendouzhe mean?","options":["Striver","Snow dragon","Big whale","Deep sea"],"answer":0,"explanation_cn":"第一句写 which means striver（意思是努力奋斗的人）。"},{"id":"w8-sat-rd2","type":"choice","question":"Where did Fendouzhe dive in 2020?","options":["To the Mariana Trench","To the South Pole","To a coral garden","To a big river"],"answer":0,"explanation_cn":"第二句说 the deepest place on the earth, the Mariana Trench（地球最深处马里亚纳海沟）。"},{"id":"w8-sat-rd3","type":"choice","question":"What do the ship's lights show in the dark water?","options":["Strange fish and soft coral","Big ships and boats","Sandy beaches","Green trees"],"answer":0,"explanation_cn":"第四句写 strange fish and soft coral（奇怪的鱼和柔软的珊瑚）。"},{"id":"w8-sat-rd4","type":"choice","question":"What do scientists bring back to study?","options":["Small samples","Big whales","Cameras","Colourful lights"],"answer":0,"explanation_cn":"第五句说 bring back small samples to study（带回小样本来研究）。"}]},{"id":"w8-sat-kb","name_cn":"今天学的词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w8-sat-kb1","type":"fill","question":"海洋：o____ [填完整单词]","answer":"ocean","explanation_cn":"ocean 读 /ˈəʊʃn/；太平洋是 the Pacific Ocean。"},{"id":"w8-sat-kb2","type":"fill","question":"潜水员：d___ [填完整单词]","answer":"diver","explanation_cn":"dive 潜水 + er 人；diver 就是潜水员。"},{"id":"w8-sat-kb3","type":"fill","question":"珊瑚：c____ [填完整单词]","answer":"coral","explanation_cn":"coral 读 /ˈkɒrəl/；珊瑚礁是 coral reef。"},{"id":"w8-sat-kb4","type":"fill","question":"生物；动物：c_______ [填完整单词]","answer":"creature","explanation_cn":"crea + ture；sea creature 海洋生物。"}]}]},{"day_cn":"周日","day_en":"Sunday","is_speaking_day":false,"total_duration":21,"theme_cn":"高频词汇 + 完形填空（科技馆研学日） + 键盘拼写","modules":[{"id":"w8-sun-vocab","name_cn":"高频词汇","type":"vocabulary_game","duration":5,"words":[{"word":"satellite","phonetic":"/ˈsætəlaɪt/","meaning":"卫星","emoji":"🛰️","example_en":"The satellite sends messages back to the earth.","example_cn":"卫星把信息发回地球。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🛞","🔋","📦","🛰️"],"answer":3},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🚀","🔋","🛰️","🛞"],"answer":2},{"type":"meaning_choice","prompt":"satellite 是什么意思？（1/2）","options":["模型","轮子","电池","卫星"],"answer":3},{"type":"meaning_choice","prompt":"satellite 是什么意思？（2/2）","options":["卫星","包裹","轮子","模型"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: sat__lite","answer":"el"}],"letters":["s","a","t","e","l","l","i","t","e"],"syllables":["sat","el","lite"],"hint_cn":"绕着地球转、帮我们导航的小机器"},{"word":"model","phonetic":"/ˈmɒdl/","meaning":"模型","emoji":"🚀","example_en":"We watched a model rocket fly up in the museum.","example_cn":"我们在博物馆看了一枚火箭模型飞起来。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["📦","🚀","🛞","🛰️"],"answer":1},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🚀","🔋","🛞","📦"],"answer":0},{"type":"meaning_choice","prompt":"model 是什么意思？（1/2）","options":["模型","包裹","轮子","电池"],"answer":0},{"type":"meaning_choice","prompt":"model 是什么意思？（2/2）","options":["轮子","包裹","电池","模型"],"answer":3},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: m__el","answer":"od"}],"letters":["m","o","d","e","l"],"syllables":["mod","el"],"hint_cn":"照着真东西做的小样品，role model 是榜样"},{"word":"battery","phonetic":"/ˈbætri/","meaning":"电池","emoji":"🔋","example_en":"The toy robot cannot move without a battery.","example_cn":"玩具机器人没有电池就动不了。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🚀","📦","🛞","🔋"],"answer":3},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🚀","🛰️","📦","🔋"],"answer":3},{"type":"meaning_choice","prompt":"battery 是什么意思？（1/2）","options":["模型","包裹","电池","轮子"],"answer":2},{"type":"meaning_choice","prompt":"battery 是什么意思？（2/2）","options":["电池","包裹","轮子","卫星"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: ba__ery","answer":"tt"}],"letters":["b","a","t","t","e","r","y"],"syllables":["bat","te","ry"],"hint_cn":"给玩具和手机供电的小方块"},{"word":"wheel","phonetic":"/wiːl/","meaning":"轮子","emoji":"🛞","example_en":"The small robot has four wheels and runs fast.","example_cn":"小机器人有四个轮子，跑得很快。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["📦","🛞","🔋","🛰️"],"answer":1},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🔋","🛞","📦","🛰️"],"answer":1},{"type":"meaning_choice","prompt":"wheel 是什么意思？（1/2）","options":["包裹","轮子","模型","卫星"],"answer":1},{"type":"meaning_choice","prompt":"wheel 是什么意思？（2/2）","options":["电池","轮子","卫星","包裹"],"answer":1},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: w__el","answer":"he"}],"letters":["w","h","e","e","l"],"syllables":["wheel"],"hint_cn":"圆的、会转的，车靠它跑，wh 开头"},{"word":"package","phonetic":"/ˈpækɪdʒ/","meaning":"包裹","emoji":"📦","example_en":"The robot carried a heavy package to our door.","example_cn":"机器人把一个重包裹搬到了我家门口。","stages":[{"type":"learn","instruction":"看图学单词"},{"type":"image_choice","prompt":"听发音，选图片（1/2）","options":["🚀","🔋","📦","🛞"],"answer":2},{"type":"image_choice","prompt":"听发音，选图片（2/2）","options":["🚀","🛰️","🛞","📦"],"answer":3},{"type":"meaning_choice","prompt":"package 是什么意思？（1/2）","options":["包裹","卫星","轮子","模型"],"answer":0},{"type":"meaning_choice","prompt":"package 是什么意思？（2/2）","options":["包裹","卫星","模型","轮子"],"answer":0},{"type":"letter_read","prompt":"跟读字母（每个字母读两遍）"},{"type":"syllable_blend","prompt":"拼合音标（每个音节读两遍）"},{"type":"spell_fill","prompt":"补全拼写: pa__age","answer":"ck"}],"letters":["p","a","c","k","a","g","e"],"syllables":["pack","age"],"hint_cn":"打包好要送出的纸箱子"}]},{"id":"w8-sun-cloze","name_cn":"完形填空 · 科技馆研学日","type":"cloze","duration":10,"passage":"Last Saturday our class visited the science museum in our city. At the gate, our teacher gave each of us a small 1___ and asked us to write down new words. First we watched a model rocket fly up, and the guide told us how satellites send 2___ to the earth. Then we saw a small robot with four wheels carry a heavy 3___ to the door. In the deep-sea room, a screen showed us the beautiful coral under the 4___ and a diver swimming beside the fish. My friend Tom said the penguin video was the 5___ part of the day. On the bus, we talked about the trip and promised to come 6___ soon.","passage_cn":"上个星期六，我们班参观了我们城市的科学博物馆。在门口，老师发给每个人一个小笔记本，让我们记下新单词。我们先看了一枚火箭模型飞起来，讲解员告诉我们卫星是怎样把信息发回地球的。接着我们看见一台有四个轮子的小机器人把一个重重的包裹搬到门口。在深海展区，一块大屏幕给我们看了海底美丽的珊瑚，还有一位潜水员在鱼群旁边游。我的朋友汤姆说，企鹅的视频是这一天最棒的部分。回程的公交车上，我们一路聊着这次参观，还约好很快再来一次。","questions":[{"id":"w8-sun-cz1","type":"choice","question":"1___","options":["notebook","bottle","ticket","photo"],"answer":0,"explanation_cn":"后面说 write down new words（记新单词），所以发给大家的是 notebook 笔记本。"},{"id":"w8-sun-cz2","type":"choice","question":"2___","options":["messages","money","music","medicine"],"answer":0,"explanation_cn":"卫星把信息 send messages 发回地球；money 钱、music 音乐、medicine 药都不对。"},{"id":"w8-sun-cz3","type":"choice","question":"3___","options":["package","garden","dinner","jacket"],"answer":0,"explanation_cn":"机器人送快递搬的是 package 包裹；其他三项不能被机器人搬到门口。"},{"id":"w8-sun-cz4","type":"choice","question":"4___","options":["sea","sky","tree","train"],"answer":0,"explanation_cn":"珊瑚长在海里 under the sea；这是深海展区。"},{"id":"w8-sun-cz5","type":"choice","question":"5___","options":["best","better","good","well"],"answer":0,"explanation_cn":"the 后面接最高级：the best part 最棒的部分。"},{"id":"w8-sun-cz6","type":"choice","question":"6___","options":["again","often","early","alone"],"answer":0,"explanation_cn":"come again soon 很快再来一次，是道别时的常用说法。"}]},{"id":"w8-sun-kb","name_cn":"今天学的词，敲一遍","type":"tense","duration":6,"skill":"keyboard","questions":[{"id":"w8-sun-kb1","type":"fill","question":"卫星：s_________ [填完整单词]","answer":"satellite","explanation_cn":"sat + el + lite；北斗就是中国的 satellite navigation system。"},{"id":"w8-sun-kb2","type":"fill","question":"模型：m____ [填完整单词]","answer":"model","explanation_cn":"model rocket 火箭模型；作文里拼机器人 model。"},{"id":"w8-sun-kb3","type":"fill","question":"电池：b______ [填完整单词]","answer":"battery","explanation_cn":"周五作文里的词，battery 让机器人动起来。"},{"id":"w8-sun-kb4","type":"fill","question":"轮子：w____ [填完整单词]","answer":"wheel","explanation_cn":"wheel 读 /wiːl/，wh 开头 w 要发音。"},{"id":"w8-sun-kb5","type":"fill","question":"包裹：p______ [填完整单词]","answer":"package","explanation_cn":"pack 打包 + age；机器人搬的就是 package。"}]}]}];
const HOMEWORK_WEEKS = [WEEK1, WEEK2, WEEK3, WEEK4, WEEK5, WEEK6, WEEK7, WEEK8];

// ===== v143：一天只留一个「重阅读」模块 =================================
//
// 家长 2026-10-19：「完形和阅读理解每天只出现一次……周天的时候出现了这两个
// 题型一起，孩子们压力太大了，因为每个都要做选择，还要进行中英文翻译」。
//
// 周日的题组原来是 reading + vocabulary_game + cloze 三件，阅读和完形正好
// 撞在一起 —— 两个都要选、都要逐句翻译。现在统一按一条规矩收口：
//   · 同一天里 reading / cloze 只能出现一个；
//   · 两个都在时**留完形填空**（家长 2026-10-19 选的那条）。
//
// 这里是就地改 day.modules（数组元素是同一个对象），所以后面
// `HOMEWORK_DATA = HOMEWORK_WEEKS[idx]` 拿到的就是收口之后的题组，
// 78 处读取点一处都不用动，老师下周预览也自动是收口后的样子。
(function slimHeavyReadingModules() {
  const HEAVY = ['reading', 'cloze'];
  HOMEWORK_WEEKS.forEach(function (week) {
    (week || []).forEach(function (day) {
      if (!day || !Array.isArray(day.modules)) return;
      const hasCloze = day.modules.some(function (m) { return m.type === 'cloze'; });
      let seen = {};
      day.modules = day.modules.filter(function (m) {
        if (HEAVY.indexOf(m.type) < 0) return true;
        // 同一天阅读 + 完形并存 → 丢掉阅读
        if (hasCloze && m.type === 'reading') return false;
        if (seen[m.type]) return false;      // 同一种题型也不许出现两次
        seen[m.type] = true;
        return true;
      });
    });
  });
})();

// 周锚点：第 1 周从 2026-09-28（周一）开始。日期用本地时区。
const HOMEWORK_EPOCH = new Date(2026, 8, 28);
//
// v157（家长红线，2026-10-26 教训）：HOMEWORK_WEEK_IDX 是**真实周号**，
// 不许随题库周数夹取 —— 第 5 周时题库只有 4 周，周号被夹成 3，
// 打卡 week_idx 全部写进「第 4 周」把上周的数据盖掉。
// 内容可以退化到最后一周（HOMEWORK_CONTENT_WEEK_IDX 夹取），
// 但打卡周号、日期计算必须永远真实。
const HOMEWORK_WEEK_IDX = (function () {
  const days = Math.floor((new Date().setHours(12, 0, 0, 0) - HOMEWORK_EPOCH.getTime()) / 864e5);
  const w = Math.floor(days / 7);
  return w < 0 ? 0 : w;
})();
const HOMEWORK_CONTENT_WEEK_IDX = Math.min(HOMEWORK_WEEK_IDX, HOMEWORK_WEEKS.length - 1);

// 对外暴露的仍是 7 天数组，app.js / api.js 现有逻辑全部不用改。
//
// v134：这里从 const 改成 let，只为一件事 —— 老师端「题库预览」要能翻到下周去
// （老师 2026-10-16：「老师端能够看到两周的作业题，并且每天的作业题显示的
// 和学生界面是一样的……提前把后一天的题给更新一下」）。
//
// 原来的毛病：「周计划」页两个区块都遍历同一个 HOMEWORK_DATA，于是「下周」
// 那一栏显示的其实是**本周的题**，只是把日期换成了下周的 —— 老师照着检查
// 下周的题，检查的根本不是下周要发给学生的题。今天（2026-10-16）生效的是
// WEEK_IDX=2（WEEK3），下周真正要发的是 WEEK4，页面上却看不到。
//
// 78 处读取点一处都不用动：它们读的就是这个全局名字，换入换出即可。
// app.js 每次渲染前都会调 hwSetActiveWeek() 把周次重新对齐一次，所以就算
// 中途异常退出、没走到"恢复"那一步，下一帧也会自己纠正回来。
let HOMEWORK_DATA = HOMEWORK_WEEKS[HOMEWORK_CONTENT_WEEK_IDX];

// 取「相对当前自然周偏移 offset 周」的那份题库。越界一律夹取，
// 永远不返回 undefined —— 调用方不用自己判边界。
//   offset = 0  → 本周（学生正在做的）
//   offset = 1  → 下周（老师要提前检查的）
function hwWeekData(offset) {
  const n = Number(offset) || 0;
  let i = HOMEWORK_WEEK_IDX + n;
  if (i < 0) i = 0;
  if (i > HOMEWORK_WEEKS.length - 1) i = HOMEWORK_WEEKS.length - 1;
  return HOMEWORK_WEEKS[i];
}

// 把「当前生效的一周」切到 offset 周。老师预览下周时用，退出预览切回 0。
// 只改本机这个变量，不碰云端、不碰学生端 —— 每台设备各切各的。
function hwSetActiveWeek(offset) {
  HOMEWORK_DATA = hwWeekData(offset);
  return HOMEWORK_DATA;
}

// ===== 完形填空课文的逐句中文译文（v127）=================================
//
// 完形填空的课文**没有** passage_cn（不像阅读理解是一句一句配好的中文），
// 每个模块只有 4~5 条绑在题目上的 explanation_cn —— 那是**解析**不是译文。
// 于是 v126 的逐句翻译里，没挖空的那几句拿不到参考译文，孩子读得再清楚也判
// "出入太大"，还被锁在那一屏（家长 2026-10-15 报的："明明说得很清楚了……
// 就是显示没听清，也没有正确的听力原文的中文提示，也没有下一题的选项"）。
//
// 这里按句号把每篇课文切开，逐句给出中文译文。键是模块 id，值是字符串数组，
// **顺序和 _splitSentences(passage) 完全一致**（测试会逐句核对句数）。
// 译文是给判分和"看原文"用的参考，不读给孩子听、不显示在题目里。
const CLOZE_SENTENCE_CN = {  "w8-sun-cloze": ["上个星期六，我们班参观了我们城市的科学博物馆。","在门口，老师发给每个人一个小笔记本，让我们记下新单词。","我们先看了一枚火箭模型飞起来，讲解员告诉我们卫星是怎样把信息发回地球的。","接着我们看见一台有四个轮子的小机器人把一个重重的包裹搬到门口。","在深海展区，一块大屏幕给我们看了海底美丽的珊瑚，还有一位潜水员在鱼群旁边游。","我的朋友汤姆说，企鹅的视频是这一天最棒的部分。","回程的公交车上，我们一路聊着这次参观，还约好很快再来一次。"],
  "w7-sun-cloze": ["上周五我们班沿着京杭大运河去研学。","上午我们参观了一座古老的船闸，一位工程师给我们讲这道闸门怎样帮船只上上下下。","中午我们坐在树下，吃了爸爸妈妈准备好的午餐。","下午我们沿着新修的绿道散步，还亲手种了五棵小树。","老师说很久以前这里的风把沙子吹进河里，现在草把泥土固定住了。","回来的路上我们坐了地铁，比公交车快得多。","我希望明年春天还能再来。"],
  "w6-sun-cloze": ["上周六我去社区图书馆当志愿者。","图书管理员陈老师带我参观了一圈，还给我派了一件简单的活儿。","我的工作是把还回来的书按正确顺序放回去；一开始我出了几个错，但她让我仔细看书上的标签。","到中午我已经整理完两个书架。","一个小女孩向我要一本关于动物的故事书，我给她找了一本有可爱熊猫图片的。","下午我们给跟着爸爸妈妈来的更小的孩子朗读。","我离开时，陈老师笑着说，我干得很棒。"],

  "thu-cloze": [
    "中国是茶的故乡。",
    "中国人很久很久以前就开始喝茶了。",
    "在过去，人们沿着古老的道路把茶叶运往许多国家。",
    "中国有很多种茶，比如绿茶和红茶。",
    "绿茶生长在杭州和其他温暖的地方。",
    "客人来家里时，主人总会端上一杯茶。",
    "下次你去中国人家里做客，记得好好品一品那杯茶。"
  ],
  "sun-cloze": [
    "京剧是中国最古老的民间艺术之一。",
    "它有两百多年的历史。",
    "演员们穿着漂亮的戏服，把脸画成不同的颜色。",
    "红脸代表善良勇敢的人，白脸代表坏人。",
    "许多老人喜欢在电视上或戏院里看京剧。",
    "一些孩子在学校社团里学京剧。",
    "只要你看过一次，就永远不会忘记它。"
  ],
  "w2-thu-cloze": [
    "新能源汽车在中国越来越受欢迎。",
    "它们用电不用汽油。",
    "它们产生的污染更少，所以大城市的空气变得更好。",
    "这些车还很安静。",
    "当你坐在新能源汽车里，几乎听不到发动机的声音。",
    "司机可以在充电站给车充电，就像给一部大手机充电一样。",
    "将来，街上行驶的大多数汽车都会是电动车。"
  ],
  "w2-sun-cloze": [
    "无人机是会飞的小机器，它们正在改变我们的生活。",
    "一家快递公司现在用无人机送包裹。",
    "无人机从空中带着包裹，几分钟就送到你家门口。",
    "山村里的医生也用无人机快速拿到药品。",
    "在无人机出现之前，药品要两天才能到；现在只需要三十分钟。",
    "无人机并不贵，越来越多的人可以买一台。",
    "也许有一天，我们会坐无人机出租车去上学！"
  ],
  "w3-thu-cloze": [
    "垃圾分类如今是中国城市里的重要习惯。",
    "在上海和其他很多城市，人们必须把垃圾分成四类：干垃圾、湿垃圾、可回收物和有害垃圾。",
    "香蕉皮这样的厨余是湿垃圾。",
    "瓶子、纸张和旧衣服是可回收物，因为它们能变成新的东西。",
    "电池和过期药品是有害垃圾，所以我们要特别小心地处理它们。",
    "每天给垃圾分类只花一分钟，却对地球帮助很大。",
    "如果人人都参与，我们的城市会变得干净得多、美丽得多。"
  ],
  "w3-sun-cloze": [
    "在中国，越来越多的人热爱跑步，城市马拉松比赛现在到处都有。",
    "每年，北京、上海等大城市都会举办马拉松比赛。",
    "全程大约四十二公里，通常一大早开始。",
    "很多人跑得不快，但他们坚持跑到终点。",
    "每隔几公里的补给站提供免费的水和水果。",
    "孩子们可以参加大约三公里的短程赛。",
    "马拉松不只是一场比赛，它是一堂「永不放弃」的课。"
  ],
  "w4-thu-cloze": [
    "港珠澳大桥是现代工程的奇迹。",
    "它是世界上最长的跨海大桥，全长55公里。",
    "大桥像一条海上巨龙，把香港、珠海和澳门连接起来。",
    "在大桥建成之前，香港到珠海坐车要四个小时。",
    "现在只需要四十五分钟。",
    "中段的海底隧道在海面之下穿行，大型船只可以从上方通过。",
    "如今每天有成千上万的汽车通过大桥，人们说它把三座城市连成了一个大家庭。"
  ],
  "w4-sun-cloze": [
    "汉字是世界上最古老的文字系统之一。",
    "三千多年前，人们把字刻在甲骨上。",
    "古时候，汉字长得像它们所代表的东西。",
    "比如，「山」字像三个山峰，「日」字是一个圆圈加一点。",
    "今天，中国人用笔和键盘写字，但古老的字形仍然看得出来。",
    "汉字总共有五万多个，但日常生活中人们只用几千个。",
    "汉字承载着五千年的历史，还会在未来五千年继续生长。"
  ],
  "w5-thu-cloze": [
    "港珠澳大桥是现代的奇迹。",
    "它全长55公里。",
    "大桥像一条巨龙，把香港、珠海和澳门连接起来。",
    "从前，坐车走公路要大约四个小时。",
    "现在只需要四十五分钟。",
    "海底隧道在海面之下穿行，船只可以从上方通过。",
    "人们说它把三座城市连成了一个大家庭。"
  ],
  "w5-sun-cloze": [
    "汉字非常古老。",
    "三千多年前，人们把字刻在甲骨上。",
    "古时候，汉字长得像它们所代表的东西。",
    "「山」字就像三个山峰。",
    "今天，人们用笔和键盘写字。",
    "汉字大约有五万个，但人们日常只用几千个。",
    "这些字还会在未来五千年继续生长。"
  ]
};

// ===== 词卡的中文提示（答错引导用，v107）=====
//
// 家长原话：「词的相关意思，或者相关搭配，就是最浅显的意思去提醒他」，
// 而且**不要一上来就把释义端出来**。所以每个词给一句"围绕意思"的话：
// 说场景、说用途、说搭配、说它像什么 —— 但**不出现 meaning 里的那几个字**
// （"选意思"那两题的选项就是释义原文，提示里带上就等于直给答案）。
//
// app.js 的 _wrongHintHtml 会按阶梯把它端出来：第 1 次错就给这句，第 2 次错
// 配上"长相"或我们学过的例句，第 3 次起给最强的提示 —— 词汇题**永远不点名
// 是哪一张卡**，最后那一下永远要孩子自己点。
const VOCAB_HINTS = {
  // 第 1 周
  beautiful: '看到花、看到晚霞，心里觉得“真好看”的那种感觉',
  library: '一个很安静的地方，书很多，可以把书借回家看',
  honest: '说真话、不骗人，答应过的事一定做到',
  celebrate: '生日那天、过节那天，大家一起热闹一下',
  discover: '原来不知道的东西，忽然被找到了',
  adventure: '去陌生的地方走一走，路上又惊又好玩',
  imagine: '闭上眼睛，在脑子里“看见”从来没去过的地方',
  protect: '挡在前面，不让它受伤害',
  success: '努力以后，事情办成了',
  explore: '走进没去过的地方，看看里面到底有什么',
  curious: '什么都想问“为什么”，总想弄个明白',
  ancient: '很久很久以前留下来的，老得不得了',
  neighbor: '住在你家隔壁的那个人',
  dangerous: '碰了会受伤，要离得远一点',
  volunteer: '不要钱也愿意去帮忙的人',
  knowledge: '书本和老师给你的那些“懂的东西”',
  healthy: '不生病、身体棒棒的',
  machine: '通上电就能帮你干活的东西',
  weather: '今天晴还是下雨，出门前要看一看',
  surprise: '事先一点都不知道，突然发生的开心事',
  // 第 2 周
  breakfast: '早上刚起来吃的那一顿',
  delicious: '吃一口就忍不住想再吃一口',
  vegetable: '青菜、胡萝卜那一类，吃了对身体好',
  umbrella: '下雨天撑着它，就不会被淋湿',
  exercise: '跑步、跳绳，让身体变棒',
  panda: '黑白两色、胖胖的，最爱吃竹子',
  bamboo: '一节一节的，长得很高，熊猫最爱吃',
  forest: '树很多很多的地方，动物住在里面',
  clever: '脑子转得快，一点就通',
  friendly: '见谁都笑眯眯，愿意和你一起玩',
  guitar: '有六根弦，抱着弹会叮咚响',
  painting: '用画笔和颜料做出来的作品',
  chess: '黑白格子的棋盘，两个人你一步我一步',
  camera: '咔嚓一下，把风景留下来',
  prize: '比赛赢了以后，发给你的那样东西',
  // 第 3 周
  spring: '一年开头的那一季，花会开、草会绿',
  kite: '有线牵着，能飞到天上去',
  autumn: '树叶变黄往下落的那一季',
  snowman: '下雪天用雪堆出来的“人”',
  picnic: '带着好吃的，去草地上坐着吃',
  journey: '从这儿到那儿，路上一整段',
  island: '四面都是水，中间一块陆地',
  treasure: '海盗箱子里那些金银宝贝',
  brave: '心里不害怕，敢往前冲',
  rescue: '把遇到危险的人或小动物救出来',
  museum: '一个地方，里面摆着很多老东西给人看',
  dinosaur: '很久很久以前的大动物，现在早就没有了',
  planet: '天上绕着太阳转的大球，地球就是其中一个',
  telescope: '用它看，很远的星星会变得很大',
  rocket: '点着火，一下就冲到天上去',
  beach: '海边的沙子地，可以光着脚踩',
  wave: '海里一层一层涌过来的水',
  sandcastle: '用湿沙子堆出来的小城堡',
  sunshine: '太阳照下来的、暖暖的光',
  dolphin: '海里的动物，会跳出水面，特别聪明',
  // 第 4 周
  competition: '大家比一比，看谁做得更好',
  nervous: '心里怦怦跳，手心都出汗了',
  medal: '挂在脖子上的那块小圆牌',
  bronze: '颜色像旧铜，得第三名拿到的那种牌',
  practise: '一遍一遍地做，做到很熟',
  invent: '想出一个新东西，以前从来没有过',
  experiment: '动手试一试，看看会发生什么',
  recycle: '用过的瓶子纸箱送回去，重新做成新东西',
  pollution: '水变黑了、天变灰了，就是因为这个',
  energy: '让灯亮起来、让车跑起来的“力气”',
  soldier: '穿军装、保卫国家的人',
  palace: '古代国王住的那种大房子',
  silk: '摸起来滑滑的、亮亮的布',
  trade: '你有我需要的，我有你需要的，换一换',
  wonder: '看到会“哇”一声的东西，比如长城',
  pyramid: '埃及那种尖尖的、三角形的大石头建筑',
  desert: '全是沙子、很少下雨的地方',
  camel: '背上有鼓包，能在沙子里走很久',
  mystery: '想不明白、还等着人去解开的事',
  guide: '带你逛、给你讲的那个人',
  sight: '用眼睛看东西的能力',
  silent: '一点点声音都没有',
  courage: '心里有点怕，但还是敢去做',
  university: '读完中学以后去读书的地方',
  disease: '让人生病、身体不舒服的东西'
};

// 挂到词卡上：第 1 周手写的条目和第 2-4 周 vocabWord() 生成的条目一起走，
// app.js 只认 w.hint_cn。改提示词只动上面那张表就行。
(function attachVocabHints() {
  HOMEWORK_WEEKS.forEach(function (wk) {
    wk.forEach(function (d) {
      (d.modules || []).forEach(function (m) {
        if (m.type !== 'vocabulary_game') return;
        (m.words || []).forEach(function (w) {
          if (VOCAB_HINTS[w.word]) w.hint_cn = VOCAB_HINTS[w.word];
        });
      });
    });
  });
})();

// ===== AI 口语练习：答错后的中文提示（v137）=============================
//
// 家长 2026-10-17：「今天的 AI 口语练习，选错了答案，它会提示，但是提示得太
// 傻了。他告诉不是 A 就是 B、就是 C，从逻辑上告诉大家是错的，但是他没有告诉
// 学生题是什么意思。比如说问句是什么意思、找的答句是什么意思，像老师一步一
// 步启发学生那样的中文给提示出来。」
//
// 病根：口语题只有英文选项，孩子手里**没有任何中文坐标** —— 他连自己选的
// 那句在说什么都不知道，你再跟他说"不是这个、在剩下的里面挑"，等于什么都没说。
//
// 所以每题配两样东西：
//   w = 这道题在问什么、答句该说什么（意思层面，绝不说"第几句""ABCD"）
//   o = 四个选项各自的中文意思，顺序和 options 一一对应
// 有了 o，答错时才能说"你选的那句意思是……，它答的不是这个问题"，
// 一步一步把孩子领到"读懂意思再选"，而不是让他按字母瞎猜。
const SPEAK_HINTS = {
  // ---------- 第 1 周 ----------
  'mon-sp1': {
    w: '它在问「哪一门科目」，答句只要说出一个科目名，别的都不用说。',
    o: ['我最喜欢的科目是英语。', '我喜欢踢足球。', '我中午吃午饭。', '我坐公交车去上学。']
  },
  'mon-sp2': {
    w: '它在问「用什么方式去」，答句要说走路、骑车、坐公交车这类出行方式。',
    o: ['我坐公交车去上学。', '我喜欢读书。', '我的学校很大。', '我有五节课。']
  },
  'mon-sp3': {
    w: '它在问「上周末做了什么」，答句要说过去做过的一件事，动词要用过去式。',
    o: ['我和家人去了公园。', '我正在做作业。', '我将去看望奶奶。', '我喜欢游泳。']
  },
  'mon-sp4': {
    w: '这是在请你介绍家人，答句要说家里有谁，而不是说宠物、学校或吃的。',
    o: ['当然！我家有四口人：爸爸、妈妈、姐姐和我。', '我有一只宠物狗。', '我的学校离家很远。', '我不喜欢蔬菜。']
  },
  'mon-sp5': {
    w: '它在问「将来想做什么职业」，答句要说出一种职业，最好再说说为什么。',
    o: ['我想当医生，因为我想帮助生病的人。', '我今年十岁。', '我喜欢玩游戏。', '我妈妈是老师。']
  },
  'wed-sp1': {
    w: '它在问「几点」，答句里一定要出现一个具体的时间，比如 at 6:30。',
    o: ['我通常早上六点半起床。', '我正在吃早饭。', '我喜欢睡觉。', '现在是早上。']
  },
  'wed-sp2': {
    w: '它在问「天气怎么样」，答句要用 sunny、rainy、windy 这类词说天气。',
    o: ['今天晴朗又暖和。', '我喜欢夏天。', '我最喜欢的颜色是蓝色。', '我不知道。']
  },
  'wed-sp3': {
    w: '它在问「打算做什么」，答句要说将来的计划，用 be going to 或 will。',
    o: ['我打算去北京看望爷爷奶奶。', '我去了公园。', '我是一名学生。', '我有一本书。']
  },
  'wed-sp4': {
    w: '这是在请你说说好朋友长什么样、人怎么样，答句要有外貌或者性格。',
    o: ['当然！她又高又善良，留着长头发，总是帮助别人。', '我有一只狗。', '我的朋友在家。', '我不喜欢她。']
  },
  'wed-sp5': {
    w: '它问了两件事：最喜欢的食物 + 为什么，答句最好两样都有（…because…）。',
    o: ['我最喜欢的食物是饺子，因为它们很好吃。', '我饿了。', '我在学校吃午饭。', '食物很重要。']
  },
  'sat-sp1': {
    w: '它在问「周末通常做什么」，答句要说一件具体的活动，usually 表示习惯。',
    o: ['我周末通常和朋友们打篮球。', '我是一名学生。', '我有一只猫。', '今天是星期天。']
  },
  'sat-sp2': {
    w: '它问「最喜欢的节日 + 为什么」，答句要说出节日名，再说一句理由。',
    o: ['我最喜欢的节日是春节，因为我可以收到红包。', '我喜欢吃东西。', '今天是节日。', '我不知道。']
  },
  'sat-sp3': {
    w: '它在问「怎么庆祝」，答句要说生日那天的活动，不是日期。',
    o: ['我通常和家人朋友一起开生日聚会。', '我很开心。', '我的生日在五月。', '我喜欢蛋糕。']
  },
  'sat-sp4': {
    w: '这是假设句，问「如果……你会做什么」，答句要用 If … I would … 说出你会做的事。',
    o: ['如果我有一百万美元，我会环游世界。', '我有钱。', '我喜欢美元。', '钱很重要。']
  },
  'sat-sp5': {
    w: '这是请你介绍一本书，答句要有书名，再说书里讲了什么。',
    o: ['我最近读了《哈利·波特》，讲的是一个去魔法学校上学的小巫师。', '我不喜欢读书。', '书很贵。', '我每天都读书。']
  },

  // ---------- 第 2 周 ----------
  'w2-mon-sp1': {
    w: '它在问「几点起床」，答句要有具体时间，而且必须是起床这件事。',
    o: ['上学日我六点半起床。', '我六点半睡觉。', '我八点开始上课。', '我十二点吃了午饭。']
  },
  'w2-mon-sp2': {
    w: '它在问「最喜欢的食物」，答句要说食物名，不要答颜色或者科目。',
    o: ['我最喜欢的食物是面条。', '我最喜欢的颜色是蓝色。', '我最喜欢的科目是美术。', '我现在在看电视。']
  },
  'w2-mon-sp3': {
    w: '它在问「通常做什么」（习惯），答句要用一般现在时，不能答"正在做"或"昨天做"。',
    o: ['我通常先做作业。', '我现在正在做作业。', '我昨天做了作业。', '我明天要去上学。']
  },
  'w2-mon-sp4': {
    w: '它在问「今天」的天气，答句要说今天，不能答昨天。',
    o: ['今天晴朗又暖和。', '昨天下雨了。', '今天是我妹妹的生日。', '一个星期有七天。']
  },
  'w2-mon-sp5': {
    w: '它问的是「你」怎么帮忙，答句的主语要是 I，不能答别人做家务。',
    o: ['我常常在晚饭后洗碗。', '我妈妈给我们做晚饭。', '厨房很干净。', '晚饭六点做好。']
  },
  'w2-wed-sp1': {
    w: '它在问「去了哪里」（过去），答句要说一个地点，而且要用过去式。',
    o: ['我和爸爸妈妈去了动物园。', '我明天要去动物园。', '我常常去图书馆。', '我现在在家。']
  },
  'w2-wed-sp2': {
    w: '它在问「最喜欢的动物」，答句要说动物名，不能答水果、颜色或者几口人。',
    o: ['我最喜欢的动物是熊猫。', '我最喜欢的水果是苹果。', '我家里有两只猫。', '熊猫生活在中国。']
  },
  'w2-wed-sp3': {
    w: '这是 Do you… 问句，答句要先说 Yes, I do. 或 No, I don\'t.，再补一句。',
    o: ['是的，我喜欢。我会做鸡蛋和薄饼。', '是的，我是。我现在在做饭。', '我昨晚做了鱼。', '做饭要花很长时间。']
  },
  'w2-wed-sp4': {
    w: '它在问「将来做什么职业」，答句要用 I want to be a … 说出一种职业。',
    o: ['我想当医生。', '我想买一个医生。', '我想当医生的办公室。', '我现在是学生。']
  },
  'w2-wed-sp5': {
    w: '它在问「最喜欢的季节」（春/夏/秋/冬），不要答月份。',
    o: ['我最喜欢的季节是秋天。', '我最喜欢的月份是五月。', '现在是秋天。', '一年有四个季节。']
  },
  'w2-sat-sp1': {
    w: '它在问「空闲时间做什么」（习惯），答句要用一般现在时。',
    o: ['我空闲时间读故事书。', '我昨天做了作业。', '这个星期天我有空。', '我的空闲时间很少。']
  },
  'w2-sat-sp2': {
    w: '这是 Can you… 问句，答句要先说 Yes, I can. 或 No, I can\'t.，再补一句。',
    o: ['是的，我会弹钢琴。', '是的，我很喜欢音乐。', '我现在在听音乐。', '钢琴很贵。']
  },
  'w2-sat-sp3': {
    w: '它在问「谁」，答句要说出一个人的名字，不是说他喜欢什么、几岁。',
    o: ['我最好的朋友是艾玛，我们在同一个班。', '我最好的朋友喜欢冰淇淋。', '我骑自行车上学。', '艾玛十岁。']
  },
  'w2-sat-sp4': {
    w: '它在问「昨天吃了什么」（过去），答句要用过去式 had。',
    o: ['我吃了米饭和鱼。', '我每天吃米饭和鱼。', '我将要吃米饭和鱼。', '我很喜欢鱼。']
  },
  'w2-sat-sp5': {
    w: '这是 Do you… 问句，答句要先说 Yes, I do. 或 No, I don\'t.，再补一句理由。',
    o: ['不太喜欢，我觉得很累人。', '是的，我昨天去购物了。', '商店九点开门。', '我妈妈喜欢购物。']
  },

  // ---------- 第 3 周 ----------
  'w3-mon-sp1': {
    w: 'How long 问的是「多长时间」，答句要说 for nine years 这样的时间段。',
    o: ['我在这里住了九年了。', '我和父母住在这里。', '我 2020 年住在这里。', '我明年会住在这里。']
  },
  'w3-mon-sp2': {
    w: '它在问「擅长什么」，答句要用 be good at 说出一件具体的事。',
    o: ['我擅长游泳。', '我对我妹妹很好。', '我现在正在游泳。', '游泳很难。']
  },
  'w3-mon-sp3': {
    w: '它在问「早餐吃什么」，答句要说早餐的食物，不能答午饭。',
    o: ['我早餐通常吃鸡蛋和牛奶。', '我通常在学校吃午饭。', '我昨天吃了鸡蛋。', '我明天要吃面包。']
  },
  'w3-mon-sp4': {
    w: 'What … like 是在问「是什么样的」，答句要描述环境，比如安静、旁边有大公园。',
    o: ['那里很安静，附近有一个大公园。', '这是我最喜欢的地方。', '我家有四口人。', '我很喜欢我的邻居。']
  },
  'w3-mon-sp5': {
    w: '它在问「上个生日做了什么」（过去），答句要用过去式。',
    o: ['我和朋友们开了一个聚会。', '我每年都开聚会。', '我很快就会开聚会。', '我的生日在五月。']
  },
  'w3-wed-sp1': {
    w: '它在问「收到过的最好的礼物」，答句要说出一样东西。',
    o: ['我收到过最好的礼物是一辆自行车。', '我下周会收到一份礼物。', '礼物很贵。', '我喜欢收礼物。']
  },
  'w3-wed-sp2': {
    w: 'How long does it take 问的是「花多长时间」，答句要用 It takes me … 加时间段。',
    o: ['我坐公交车大约要十五分钟。', '它有十五分钟长。', '我坐公交车去上学。', '我的学校离家很近。']
  },
  'w3-wed-sp3': {
    w: '它在问「打算做什么」（将来），答句要用 be going to 或 will。',
    o: ['我打算去看望爷爷奶奶。', '我上周末去看他们了。', '我每天去上学。', '他们住在乡下。']
  },
  'w3-wed-sp4': {
    w: '它在问「最喜欢的书」，答句要说出书名。',
    o: ['我最喜欢的书是《哈利·波特》。', '我在晚上读书。', '书是我的朋友。', '我昨天买了一本书。']
  },
  'w3-wed-sp5': {
    w: '这是 Do you… 问句，答句要先说 Yes, I do. 或 No, I don\'t.，再说你做什么。',
    o: ['是的，我每天打扫我的房间。', '是的，我父母打扫房子。', '家务不轻松。', '我现在在打扫厨房。']
  },
  'w3-sat-sp1': {
    w: '它在问「上周日做了什么」（过去），答句要用过去式。',
    o: ['我帮妈妈打扫了房子。', '我每个星期天都帮她。', '我明天要打扫房子。', '我妈妈打扫房子。']
  },
  'w3-sat-sp2': {
    w: '它在问「哪种」，答句要说出电影的类型，比如卡通片、动作片。',
    o: ['我最喜欢卡通片。', '我昨晚看了一部电影。', '电影七点开始。', '我很喜欢爆米花。']
  },
  'w3-sat-sp3': {
    w: 'How often 问的是「多久一次」，答句要用 once a week、three times a week 这类说法。',
    o: ['我一周运动三次。', '我昨天打了篮球。', '我篮球打得很好。', '运动对我们有好处。']
  },
  'w3-sat-sp4': {
    w: '它在问「哪个地方」，答句要说出一个地点的名字。',
    o: ['我最喜欢的地方是城市图书馆。', '我住在图书馆附近。', '这个城市很大。', '我每个周末都去那里。']
  },
  'w3-sat-sp5': {
    w: '这是 Do you… 问句，答句要先说 Yes, I do. 或 No, I don\'t.，再补一句理由。',
    o: ['是的，我喜欢。我很爱去新的地方。', '是的，我 2023 年去北京旅行了。', '旅行要花很多钱。', '我爸爸因为工作经常出差。']
  },

  // ---------- 第 4 周 ----------
  'w4-mon-sp1': {
    w: '这是假设句，答句要用 If … I would … 说出你会做的事。',
    o: ['如果我赢了大奖，我会环游世界。', '如果我将会得奖，我很开心。', '我去年得过一次奖。', '奖品是给小朋友的。']
  },
  'w4-mon-sp2': {
    w: '这是在问你的看法，答句要先说 Yes/No 或者 I think…，再说一句理由。',
    o: ['是的，我认为校服让我们看起来整洁。', '是的，我现在穿着校服。', '校服是棉花做的。', '我的校服对我来说太大了。']
  },
  'w4-mon-sp3': {
    w: '它在问「哪个发明」，答句要说出一样东西，比如手机、电灯。',
    o: ['我认为最有用的发明是手机。', '我昨天发明了一架纸飞机。', '发明很有趣。', '我的手机是新的。']
  },
  'w4-mon-sp4': {
    w: '它在问「怎么保护环境」，答句要说出具体做法，比如垃圾分类、节约用水。',
    o: ['我们在家给垃圾分类，还节约用水。', '环境非常重要。', '我家在一个公园附近。', '外面污染很严重。']
  },
  'w4-mon-sp5': {
    w: 'Which 是在几门科目里选一门，答句要说出科目名，再加上一句感受。',
    o: ['数学。不过我在进步。', '我在书桌上找到了我的数学书。', '数学是我今天的第一节课。', '我喜欢所有的老师。']
  },
  'w4-wed-sp1': {
    w: '它在问「毕业后想做什么」（将来的打算），答句要用 would like to / want to 加动词。',
    o: ['我想在大学学医。', '我想完成了我的作业。', '我去年毕业了。', '学校很有趣。']
  },
  'w4-wed-sp2': {
    w: '这是请你介绍一个人，答句要说他是谁，再说你敬佩他什么。',
    o: ['我敬佩我的体育老师，因为他从不放弃。', '我敬佩他跑得快。', '我的体育老师也教数学。', '我把书给了他。']
  },
  'w4-wed-sp3': {
    w: '它在问「怎么保持健康」，答句要说出具体做法，比如跑步、早睡。',
    o: ['我每天早上跑步，而且睡得早。', '我很健康。', '健康非常重要。', '我妈妈做的饭很健康。']
  },
  'w4-wed-sp4': {
    w: '这是假设句，答句要用 I would like to … 说出你想要的超能力，最好再说为什么。',
    o: ['我想飞，这样就能看到整个世界。', '我明年会有超能力。', '超能力不是真实的东西。', '我能跑得很快。']
  },
  'w4-wed-sp5': {
    w: '它在问「最好的一次旅行」，答句要说出去了哪里。',
    o: ['最好的一次旅行是和同学去西安。', '今年夏天我要去旅行。', '旅行总是很累。', '我坐公交车上学。']
  },
  'w4-sat-sp1': {
    w: '它在问「你会给什么建议」，答句要用 I would tell him to … 说出一个建议。',
    o: ['我会告诉他深呼吸，相信自己。', '我会告诉他考试很简单。', '我上周告诉他要更努力学习。', '他考试总是很紧张。']
  },
  'w4-sat-sp2': {
    w: '这是二选一，答句要先说你选哪一个，再说理由（because…）。',
    o: ['我更喜欢看书，因为我可以自己想象画面。', '我更喜欢在家看电视。', '我昨晚看了一部电影。', '书和电影都很便宜。']
  },
  'w4-sat-sp3': {
    w: '它在问「最重要的一样东西」，答句要说出一样具体的收获。',
    o: ['学会怎么学习是最重要的。', '我学了六年英语。', '学校的楼很旧。', '我学会了守时。']
  },
  'w4-sat-sp4': {
    w: '它在问「怎样帮助老人」，答句要用 We can … 说出具体做法。',
    o: ['我们可以去看望他们，帮他们拿东西。', '老人喜欢谈过去的事。', '我们的社区很大。', '他们通常起得很早。']
  },
  'w4-sat-sp5': {
    w: '这是假设句，答句要用 I would go to … 说出一个地方。',
    o: ['我想去埃及看金字塔。', '我下个月要去埃及。', '我和父母去过埃及。', '埃及在非洲。']
  }
};

// 挂到题目上（app.js 只认 q.answer_cn_hint / q.options_cn）。
// 题量对不上的条目直接跳过 —— 宁可退回到原来的简单提示，也不能因为
// 中英选项错位把「正确答案」翻错，那会误导孩子。
(function attachSpeakHints() {
  HOMEWORK_WEEKS.forEach(function (wk) {
    wk.forEach(function (d) {
      (d.modules || []).forEach(function (m) {
        if (m.type !== 'speaking') return;
        (m.questions || []).forEach(function (q) {
          const t = SPEAK_HINTS[q.id];
          if (!t || !t.o || !q.options || t.o.length !== q.options.length) return;
          q.answer_cn_hint = t.w;
          q.options_cn = t.o.slice();
        });
      });
    });
  });
})();
