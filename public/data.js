// 题库数据 —— v153 由 tools/apply-v153-content.js 生成，v154 由 tools/apply-v154-trim.js 裁量。
// 每天 30 个单元：带词汇的日子 25 题 + 5 词，不带词汇的日子 30 题（家长：所有题加单词加起来 30 道）。
// 阅读/完形/写作主题 = 中国文化 · 科学技术 · 现代热点。
// 改题库：改 tools/v153-content-*.js 重跑 v153 脚本，再跑本脚本，最后 node tools/verify-weeks.js。

const WEEK1 = [
  {
    "day_cn": "周一",
    "day_en": "Monday",
    "is_speaking_day": true,
    "total_duration": 55,
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
            "id": "mon-rd3",
            "type": "choice",
            "question": "What do people do before the festival?",
            "options": [
              "They go swimming in the sea.",
              "They clean their houses and buy new clothes.",
              "They plant many trees.",
              "They sleep at home all day."
            ],
            "answer": 1,
            "explanation_cn": "第三句：clean their houses and buy new clothes（打扫房子、买新衣服）。"
          },
          {
            "id": "mon-rd4",
            "type": "choice",
            "question": "When does the whole family enjoy a big dinner?",
            "options": [
              "On Monday morning",
              "After the festival",
              "At noon every day",
              "On New Year's Eve"
            ],
            "answer": 3,
            "explanation_cn": "除夕夜（New Year's Eve）全家人聚在一起吃年夜饭。"
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
            "id": "mon-rd6",
            "type": "choice",
            "question": "Where is the lucky money put?",
            "options": [
              "In blue boxes",
              "In white bags",
              "In red envelopes",
              "In school bags"
            ],
            "answer": 2,
            "explanation_cn": "压岁钱装在红包（red envelopes）里。"
          },
          {
            "id": "mon-rd7",
            "type": "choice",
            "question": "What do people say to each other during the festival?",
            "options": [
              "\"Good night\"",
              "\"Happy New Year\"",
              "\"Happy birthday\"",
              "\"See you tomorrow\""
            ],
            "answer": 1,
            "explanation_cn": "人们见面互相说「Happy New Year（新年快乐）」。"
          },
          {
            "id": "mon-rd8",
            "type": "choice",
            "question": "\"Get together\" in the passage means ___.",
            "options": [
              "meet and stay with family",
              "have a fight",
              "go to school",
              "take a trip"
            ],
            "answer": 0,
            "explanation_cn": "get together 意思是「聚在一起」，除夕夜全家人团聚吃年夜饭。"
          },
          {
            "id": "mon-rd9",
            "type": "choice",
            "question": "Which of the following is NOT in the passage?",
            "options": [
              "People go swimming in the sea.",
              "People clean their houses.",
              "People buy new clothes.",
              "People visit relatives and friends."
            ],
            "answer": 0,
            "explanation_cn": "文章没有说人们去海边游泳，其余三项都在文中。"
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
          },
          {
            "id": "mon-mc5",
            "type": "choice",
            "question": "We ___ our relatives during the Spring Festival every year.",
            "options": [
              "visit",
              "visits",
              "visited",
              "visiting"
            ],
            "answer": 0,
            "explanation_cn": "every year 表示经常性动作，主语 we 是复数，动词用原形 visit。"
          }
        ]
      },
      {
        "id": "mon-tense2",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "mon-tn21",
            "type": "fill",
            "question": "The Spring Festival usually ___ (come) in January or February. [填入正确形式]",
            "answer": "comes",
            "explanation_cn": "usually 表示习惯，主语三单，动词加 es。"
          },
          {
            "id": "mon-tn22",
            "type": "fill",
            "question": "We ___ (clean) our house before the festival next week. [填入正确形式]",
            "answer": "will clean",
            "explanation_cn": "next week 将来时间，用 will clean。"
          },
          {
            "id": "mon-tn23",
            "type": "fill",
            "question": "Last year, I ___ (get) lucky money from my grandma. [填入正确形式]",
            "answer": "got",
            "explanation_cn": "last year 过去时间，get 的过去式是 got。"
          },
          {
            "id": "mon-tn24",
            "type": "fill",
            "question": "Look! Mom ___ (cook) the big dinner now. [填入正确形式]",
            "answer": "is cooking",
            "explanation_cn": "Look! 提示正在进行，用 is cooking。"
          },
          {
            "id": "mon-tn25",
            "type": "fill",
            "question": "Children ___ (love) the festival very much. [填入正确形式]",
            "answer": "love",
            "explanation_cn": "主语 children 复数，一般现在时用原形。"
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
        "passage": "The Great Wall is one of the greatest wonders in the world. It is in the north of China. It is more than 20000 kilometres long, like a huge dragon on the mountains. People started to build it over 2000 years ago. In old times, soldiers stood on the wall and watched for enemies. Today, many visitors from all over the world come to climb the Great Wall every year. When you stand on it, you can see beautiful mountains all around.",
        "passage_cn": "长城是世界上最伟大的奇迹之一。它在中国的北方。它有两万多公里长，像一条卧在群山上的巨龙。人们两千多年前就开始修建它了。古时候，士兵们站在城墙上瞭望敌人。如今，每年都有来自世界各地的游客来爬长城。当你站在长城上，四周能看到美丽的群山。",
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
            "id": "tue-rd3",
            "type": "choice",
            "question": "What does the Great Wall look like?",
            "options": [
              "A huge dragon on the mountains",
              "A long river",
              "A big house",
              "A small bridge"
            ],
            "answer": 0,
            "explanation_cn": "文中说它像一条卧在群山上的巨龙（a huge dragon）。"
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
            "id": "tue-rd5",
            "type": "choice",
            "question": "What did soldiers do on the wall in old times?",
            "options": [
              "They watched for enemies.",
              "They grew rice.",
              "They sold tea.",
              "They played football."
            ],
            "answer": 0,
            "explanation_cn": "古时候士兵站在城墙上瞭望敌人（watched for enemies）。"
          },
          {
            "id": "tue-rd6",
            "type": "choice",
            "question": "Who comes to climb the Great Wall today?",
            "options": [
              "Only Chinese students",
              "Visitors from all over the world",
              "Only old people",
              "Only the soldiers"
            ],
            "answer": 1,
            "explanation_cn": "如今每年有来自世界各地的游客来爬长城。"
          },
          {
            "id": "tue-rd7",
            "type": "choice",
            "question": "What can you see when you stand on the wall?",
            "options": [
              "Beautiful mountains",
              "A big sea",
              "Long rivers only",
              "Tall buildings only"
            ],
            "answer": 0,
            "explanation_cn": "最后一句：可以看到四周美丽的群山。"
          },
          {
            "id": "tue-rd8",
            "type": "choice",
            "question": "The word \"wonders\" here means ___.",
            "options": [
              "奇迹",
              "窗户",
              "问题",
              "商品"
            ],
            "answer": 0,
            "explanation_cn": "wonder 在这里是「奇迹」的意思，长城是世界奇迹之一。"
          },
          {
            "id": "tue-rd9",
            "type": "choice",
            "question": "How many wonders does the passage say the Great Wall belongs to?",
            "options": [
              "One of the greatest",
              "The second greatest",
              "The last one",
              "It doesn't say"
            ],
            "answer": 0,
            "explanation_cn": "第一句：one of the greatest wonders（最伟大的奇迹之一）。"
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
          },
          {
            "id": "tue-gr7",
            "type": "choice",
            "question": "It took ___ two hours to get there by bus.",
            "options": [
              "us",
              "we",
              "our",
              "ours"
            ],
            "answer": 0,
            "explanation_cn": "take 后面用宾格 us：took us two hours（花了我们两小时）。"
          },
          {
            "id": "tue-gr8",
            "type": "choice",
            "question": "___ interesting the story about the wall is!",
            "options": [
              "How",
              "What",
              "What an",
              "Where"
            ],
            "answer": 0,
            "explanation_cn": "How + 形容词 + 主谓：How interesting…!"
          },
          {
            "id": "tue-gr9",
            "type": "choice",
            "question": "The wall is famous ___ all over the world.",
            "options": [
              "to",
              "with",
              "in",
              "at"
            ],
            "answer": 2,
            "explanation_cn": "be famous in…：在全世界都有名，用 in。"
          },
          {
            "id": "tue-gr10",
            "type": "choice",
            "question": "Don't ___ on the wall. It's dangerous.",
            "options": [
              "run",
              "runs",
              "running",
              "ran"
            ],
            "answer": 0,
            "explanation_cn": "Don't 后面用动词原形：Don't run（不要跑）。"
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
          },
          {
            "id": "tue-mc9",
            "type": "choice",
            "question": "The wall is in the ___ of China.",
            "options": [
              "north",
              "northern",
              "northward",
              "northerner"
            ],
            "answer": 0,
            "explanation_cn": "in the north of China：在北方，用名词 north。"
          },
          {
            "id": "tue-mc10",
            "type": "choice",
            "question": "When you stand on it, you ___ see beautiful mountains.",
            "options": [
              "can",
              "cans",
              "is",
              "are"
            ],
            "answer": 0,
            "explanation_cn": "情态动词 can 后面用动词原形 see。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周三",
    "day_en": "Wednesday",
    "is_speaking_day": true,
    "total_duration": 55,
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
        "passage": "Giant pandas are one of the most loved animals in China. They have black and white fur and look very cute. Pandas live in the bamboo forests of Sichuan. They spend most of their day eating bamboo — about twelve hours a day! A baby panda is very, very small. It is only about 100 grams at birth, lighter than a cup of water. Pandas are good at climbing trees and swimming. Now there are panda bases in Sichuan, and scientists there help baby pandas grow up well.",
        "passage_cn": "大熊猫是中国最受喜爱的动物之一。它们长着黑白相间的毛，看起来非常可爱。大熊猫生活在四川的竹林里。它们一天中大部分时间都在吃竹子——每天大约要吃十二个小时！熊猫宝宝非常非常小。出生时只有大约100克，比一杯水还轻。大熊猫擅长爬树和游泳。现在四川建有大熊猫基地，那里的科学家帮助熊猫宝宝健康成长。",
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
            "id": "wed-rd3",
            "type": "choice",
            "question": "How long do pandas eat bamboo every day?",
            "options": [
              "About two hours",
              "About five hours",
              "About twelve hours",
              "About twenty hours"
            ],
            "answer": 2,
            "explanation_cn": "它们每天大约花十二个小时吃竹子。"
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
            "id": "wed-rd5",
            "type": "choice",
            "question": "What are pandas good at?",
            "options": [
              "Climbing trees and swimming",
              "Running very fast",
              "Jumping very high",
              "Singing and dancing"
            ],
            "answer": 0,
            "explanation_cn": "文中说熊猫擅长爬树（climbing trees）和游泳（swimming）。"
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
          },
          {
            "id": "wed-rd7",
            "type": "choice",
            "question": "Why do people love pandas?",
            "options": [
              "They look very cute.",
              "They can talk.",
              "They are very big.",
              "They can fly."
            ],
            "answer": 0,
            "explanation_cn": "第一句说熊猫是最受喜爱的动物之一，因为长得可爱。"
          },
          {
            "id": "wed-rd8",
            "type": "choice",
            "question": "What do pandas mostly eat?",
            "options": [
              "Bamboo",
              "Meat",
              "Fish",
              "Rice"
            ],
            "answer": 0,
            "explanation_cn": "它们大部分时间在吃竹子（bamboo）。"
          },
          {
            "id": "wed-rd9",
            "type": "choice",
            "question": "A baby panda at birth is lighter than ___.",
            "options": [
              "a cup of water",
              "a school bag",
              "a big dog",
              "an adult panda"
            ],
            "answer": 0,
            "explanation_cn": "文中说它比一杯水还轻（lighter than a cup of water）。"
          },
          {
            "id": "wed-rd10",
            "type": "choice",
            "question": "The best title for the panda passage is ___.",
            "options": [
              "Bamboo in Sichuan",
              "Cute Giant Pandas",
              "Animals in the Zoo",
              "Scientists at Work"
            ],
            "answer": 1,
            "explanation_cn": "全文介绍大熊猫的样子、食物、宝宝和熊猫基地。"
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
          },
          {
            "id": "wed-mc5",
            "type": "choice",
            "question": "Pandas are good at ___ trees.",
            "options": [
              "climbing",
              "climb",
              "climbed",
              "climbs"
            ],
            "answer": 0,
            "explanation_cn": "be good at doing sth：at 后面用动名词 climbing。"
          }
        ]
      },
      {
        "id": "wed-tense2",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "wed-tn21",
            "type": "fill",
            "question": "The panda ___ (spend) twelve hours a day eating. [填入正确形式]",
            "answer": "spends",
            "explanation_cn": "主语三单，一般现在时动词加 s。"
          },
          {
            "id": "wed-tn22",
            "type": "fill",
            "question": "We ___ (see) the baby panda at the base last May. [填入正确形式]",
            "answer": "saw",
            "explanation_cn": "last May 过去时间，see 的过去式是 saw。"
          },
          {
            "id": "wed-tn23",
            "type": "fill",
            "question": "Scientists ___ (help) pandas since 1963. [填入正确形式]",
            "answer": "have helped",
            "explanation_cn": "since 1963 与现在完成时连用。"
          },
          {
            "id": "wed-tn24",
            "type": "fill",
            "question": "Look! The panda ___ (climb) the tree. [填入正确形式]",
            "answer": "is climbing",
            "explanation_cn": "Look! 提示正在进行，用 is climbing。"
          },
          {
            "id": "wed-tn25",
            "type": "fill",
            "question": "Pandas ___ (not eat) meat often. [填入正确形式]",
            "answer": "don't eat",
            "explanation_cn": "主语复数，否定用 don't + 动词原形。"
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
            "audio_text": "Many visitors come to climb the Great Wall every year.",
            "options": [
              "Many visitors come to climb the Great Wall every year.",
              "Many visitors come to climb the mountain every week.",
              "Many students come to clean the Great Wall.",
              "Few visitors come to the Great Wall."
            ],
            "answer": 0,
            "explanation_cn": "主语是 visitors（游客），动词是 climb（爬），时间是 every year。"
          },
          {
            "id": "thu-ls6",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "When you stand on it, you can see beautiful mountains.",
            "options": [
              "When you stand on it, you can see beautiful mountains.",
              "When you stand on it, you can see a long river.",
              "When you sit on it, you can see beautiful flowers.",
              "When you stand under it, you can see tall buildings."
            ],
            "answer": 0,
            "explanation_cn": "stand（站）和 sit（坐）要分清；看到的是 mountains（山）。"
          },
          {
            "id": "thu-ls7",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "The wall looks like a huge dragon.",
            "options": [
              "The wall looks like a huge dragon.",
              "The wall looks like a long snake.",
              "The wall sounds like a big drum.",
              "The wall looks like a small bridge."
            ],
            "answer": 0,
            "explanation_cn": "looks like（看起来像）a huge dragon（巨龙）。"
          },
          {
            "id": "thu-ls8",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "We took a bus to the Great Wall last Sunday.",
            "options": [
              "We took a bus to the Great Wall last Sunday.",
              "We took a train to the Great Wall last Sunday.",
              "We took a bus to the Summer Palace last Sunday.",
              "We walked to the Great Wall last Sunday."
            ],
            "answer": 0,
            "explanation_cn": "交通工具是 took a bus（坐公交），地点是 the Great Wall。"
          },
          {
            "id": "thu-ls9",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "Climbing the Great Wall makes me feel proud.",
            "options": [
              "Climbing the Great Wall makes me feel proud.",
              "Climbing the Great Wall makes me feel tired.",
              "Climbing the mountain makes me feel proud.",
              "Drawing the Great Wall makes me feel happy."
            ],
            "answer": 0,
            "explanation_cn": "feel proud（感到自豪），别听成 tired（累）。"
          },
          {
            "id": "thu-ls10",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "The old wall tells us a long story.",
            "options": [
              "The old wall tells us a long story.",
              "The old man tells us a long story.",
              "The old wall tells us a short story.",
              "The old book tells us a long story."
            ],
            "answer": 0,
            "explanation_cn": "主语是 the old wall（古老的城墙），不是 the old man。"
          }
        ]
      },
      {
        "id": "thu-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "China is the home 1___ tea. People in China started to drink tea long, long ago. In the past, people 2___ tea leaves to many countries along the old roads. That road is 3___ the Tea Road today. There are many 4___ of tea in China, like green tea and black tea. Green tea is 5___ in Hangzhou and other warm places. Most Chinese people like to 6___ hot tea, not cold tea. When guests come to a Chinese home, the host always 7___ them a cup of tea. It is a way to show welcome and 8___. People also say that drinking tea is good for 9___. Next time you visit a Chinese family, remember to 10___ the tea. It carries a long history and a warm heart.",
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
              "called",
              "asked",
              "told",
              "sang"
            ],
            "answer": 0,
            "explanation_cn": "那条路「被叫做」Tea Road，用 is called。"
          },
          {
            "id": "thu-cz4",
            "type": "choice",
            "question": "4___",
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
            "id": "thu-cz5",
            "type": "choice",
            "question": "5___",
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
            "id": "thu-cz6",
            "type": "choice",
            "question": "6___",
            "options": [
              "drink",
              "eat",
              "cook",
              "wash"
            ],
            "answer": 0,
            "explanation_cn": "喝热茶用 drink hot tea。"
          },
          {
            "id": "thu-cz7",
            "type": "choice",
            "question": "7___",
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
            "id": "thu-cz8",
            "type": "choice",
            "question": "8___",
            "options": [
              "love",
              "money",
              "sleep",
              "cold"
            ],
            "answer": 0,
            "explanation_cn": "show welcome and love：表达欢迎和喜爱。"
          },
          {
            "id": "thu-cz9",
            "type": "choice",
            "question": "9___",
            "options": [
              "health",
              "homework",
              "sports",
              "music"
            ],
            "answer": 0,
            "explanation_cn": "be good for health：对健康有好处。"
          },
          {
            "id": "thu-cz10",
            "type": "choice",
            "question": "10___",
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
          },
          {
            "id": "thu-tn6",
            "type": "fill",
            "question": "We ___ (visit) a tea museum next Sunday. [填入正确形式]",
            "answer": "will visit",
            "explanation_cn": "next Sunday 是将来时间，用一般将来时 will visit。"
          },
          {
            "id": "thu-tn7",
            "type": "fill",
            "question": "The host ___ (give) us some tea just now. [填入正确形式]",
            "answer": "gave",
            "explanation_cn": "just now 刚才，用过去式 gave（give 的过去式）。"
          },
          {
            "id": "thu-tn8",
            "type": "fill",
            "question": "Tea ___ (grow) in warm places. [填入正确形式]",
            "answer": "is grown",
            "explanation_cn": "茶是被种植的，用一般现在时的被动语态 is grown。"
          },
          {
            "id": "thu-tn9",
            "type": "fill",
            "question": "While mom ___ (boil) the water, I washed the cups. [填入正确形式]",
            "answer": "was boiling",
            "explanation_cn": "while 引导的过去进行：while + was boiling（正在烧水）。"
          },
          {
            "id": "thu-tn10",
            "type": "fill",
            "question": "Remember ___ (bring) a teacup to school tomorrow. [填入正确形式]",
            "answer": "to bring",
            "explanation_cn": "remember to do sth：记得要带（还没做），用 to bring。"
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
          },
          {
            "id": "fri-gr9",
            "type": "choice",
            "question": "There ___ any milk in the tea.",
            "options": [
              "isn't",
              "aren't",
              "am not",
              "be not"
            ],
            "answer": 0,
            "explanation_cn": "milk 是不可数名词，be 动词用 isn't。"
          },
          {
            "id": "fri-gr10",
            "type": "choice",
            "question": "How ___ water do you need for the tea?",
            "options": [
              "much",
              "many",
              "long",
              "often"
            ],
            "answer": 0,
            "explanation_cn": "water 不可数，用 How much。"
          },
          {
            "id": "fri-gr11",
            "type": "choice",
            "question": "The tea ___ very popular in England now.",
            "options": [
              "is",
              "was",
              "were",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "now 提示现在时，主语 the tea 单数，用 is。"
          },
          {
            "id": "fri-gr12",
            "type": "choice",
            "question": "We ___ to a tea house and watched a show last night.",
            "options": [
              "went",
              "go",
              "goes",
              "going"
            ],
            "answer": 0,
            "explanation_cn": "last night 过去时间，go 的过去式是 went。"
          },
          {
            "id": "fri-gr13",
            "type": "choice",
            "question": "It's kind ___ you to make tea for us.",
            "options": [
              "of",
              "for",
              "to",
              "with"
            ],
            "answer": 0,
            "explanation_cn": "It's kind of you：你真好心，形容人的品质用 of。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周六",
    "day_en": "Saturday",
    "is_speaking_day": true,
    "total_duration": 55,
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
            "id": "sat-rd2",
            "type": "choice",
            "question": "What is the moon like on that day?",
            "options": [
              "Round and bright",
              "Small and dark",
              "Thin like a banana",
              "We can't see it"
            ],
            "answer": 0,
            "explanation_cn": "那时月亮又圆又亮（round and bright）。"
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
            "id": "sat-rd4",
            "type": "choice",
            "question": "What is inside mooncakes?",
            "options": [
              "Different fillings",
              "Only water",
              "Only sugar",
              "Nothing"
            ],
            "answer": 0,
            "explanation_cn": "月饼里有不同的馅（fillings），比如莲蓉和红豆。"
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
            "id": "sat-rd6",
            "type": "choice",
            "question": "What do children do under the moonlight?",
            "options": [
              "They listen to old stories about the moon.",
              "They do their homework.",
              "They go swimming.",
              "They play football."
            ],
            "answer": 0,
            "explanation_cn": "孩子们喜欢在月光下听关于月亮的古老故事。"
          },
          {
            "id": "sat-rd7",
            "type": "choice",
            "question": "Where does the family sit on that evening?",
            "options": [
              "In the open air",
              "In a cinema",
              "On a bus",
              "In a classroom"
            ],
            "answer": 0,
            "explanation_cn": "那天晚上全家人坐在户外（in the open air）赏月。"
          },
          {
            "id": "sat-rd8",
            "type": "choice",
            "question": "The word \"reunion\" here means ___.",
            "options": [
              "团聚",
              "离别",
              "旅行",
              "争吵"
            ],
            "answer": 0,
            "explanation_cn": "reunion 意思是「团聚」，圆月和圆月饼都代表团圆。"
          },
          {
            "id": "sat-rd9",
            "type": "choice",
            "question": "The Mid-Autumn Festival is a special day for ___.",
            "options": [
              "family",
              "shopping",
              "study",
              "sports"
            ],
            "answer": 0,
            "explanation_cn": "第一句：a special day for family（家人团圆的日子）。"
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
          },
          {
            "id": "sat-mc5",
            "type": "choice",
            "question": "There are many old ___ about the moon.",
            "options": [
              "stories",
              "storys",
              "story",
              "storyes"
            ],
            "answer": 0,
            "explanation_cn": "story 的复数是 stories（辅音字母+y 变 ies）。"
          }
        ]
      },
      {
        "id": "sat-tense2",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "sat-tn21",
            "type": "fill",
            "question": "The Mid-Autumn Festival ___ (come) in September or October. [填入正确形式]",
            "answer": "comes",
            "explanation_cn": "表示每年的事实，主语三单用 comes。"
          },
          {
            "id": "sat-tn22",
            "type": "fill",
            "question": "We ___ (eat) mooncakes with grandma last night. [填入正确形式]",
            "answer": "ate",
            "explanation_cn": "last night 过去时间，eat 的过去式是 ate。"
          },
          {
            "id": "sat-tn23",
            "type": "fill",
            "question": "Look! The moon ___ (rise) over the sea. [填入正确形式]",
            "answer": "is rising",
            "explanation_cn": "Look! 提示正在进行，用 is rising。"
          },
          {
            "id": "sat-tn24",
            "type": "fill",
            "question": "My family ___ (watch) the moon together every year. [填入正确形式]",
            "answer": "watches",
            "explanation_cn": "every year 习惯动作，主语 my family 整体看，三单用 watches。"
          },
          {
            "id": "sat-tn25",
            "type": "fill",
            "question": "Chang'e, the moon lady, ___ (be) in the old story. [填入正确形式]",
            "answer": "was",
            "explanation_cn": "讲过去的故事人物，用 was。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周日",
    "day_en": "Sunday",
    "is_speaking_day": false,
    "total_duration": 35,
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
        "passage": "Peking Opera is one of China's oldest 1___ arts. It started more than 200 years ago. The actors wear beautiful 2___ and paint their faces in different colours. A red face 3___ a good and brave man, and a white face means a bad man. The actors sing in a special 4___ and move in special ways. Many old people love to 5___ Peking Opera on TV or in the theatre. Some children learn it 6___ school clubs. It is not 7___ to learn, because an actor may practise for many years 8___ he can sing well. Today, more and more young people are starting to love this old art. It is an important 9___ of Chinese culture. If you watch it once, you will never 10___ it.",
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
              "way",
              "room",
              "school",
              "dinner"
            ],
            "answer": 0,
            "explanation_cn": "用特别的「方式」演唱，sing in a special way。"
          },
          {
            "id": "sun-cz5",
            "type": "choice",
            "question": "5___",
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
            "id": "sun-cz6",
            "type": "choice",
            "question": "6___",
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
            "id": "sun-cz7",
            "type": "choice",
            "question": "7___",
            "options": [
              "easy",
              "sad",
              "angry",
              "lazy"
            ],
            "answer": 0,
            "explanation_cn": "后文说要练很多年，所以学起来不「容易」，easy。"
          },
          {
            "id": "sun-cz8",
            "type": "choice",
            "question": "8___",
            "options": [
              "before",
              "after",
              "so",
              "but"
            ],
            "answer": 0,
            "explanation_cn": "练很多年「之后才」能唱好 → 在能唱好「之前」，用 before。"
          },
          {
            "id": "sun-cz9",
            "type": "choice",
            "question": "9___",
            "options": [
              "part",
              "piece",
              "page",
              "pair"
            ],
            "answer": 0,
            "explanation_cn": "an important part of Chinese culture：中国文化的重要一部分。"
          },
          {
            "id": "sun-cz10",
            "type": "choice",
            "question": "10___",
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
        "id": "sun-tense",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "sun-tn1",
            "type": "fill",
            "question": "Peking Opera ___ (start) more than 200 years ago. [填入正确形式]",
            "answer": "started",
            "explanation_cn": "more than 200 years ago 是过去时间，start 的过去式是 started。"
          },
          {
            "id": "sun-tn2",
            "type": "fill",
            "question": "Look! The actors ___ (paint) their faces now. [填入正确形式]",
            "answer": "are painting",
            "explanation_cn": "Look! 和 now 提示正在进行，用现在进行时 are painting。"
          },
          {
            "id": "sun-tn3",
            "type": "fill",
            "question": "My grandpa ___ (watch) Peking Opera every Sunday. [填入正确形式]",
            "answer": "watches",
            "explanation_cn": "every Sunday 表示习惯，主语三单，动词用 watches。"
          },
          {
            "id": "sun-tn4",
            "type": "fill",
            "question": "A red face ___ (mean) a brave man in Peking Opera. [填入正确形式]",
            "answer": "means",
            "explanation_cn": "主语 a red face 是三单，一般现在时动词加 s：means。"
          },
          {
            "id": "sun-tn5",
            "type": "fill",
            "question": "We ___ (see) a wonderful show last night. [填入正确形式]",
            "answer": "saw",
            "explanation_cn": "last night 过去时间，see 的过去式是 saw。"
          }
        ]
      },
      {
        "id": "sun-grammar",
        "name_cn": "语法练习",
        "type": "grammar",
        "duration": 5,
        "questions": [
          {
            "id": "sun-gr1",
            "type": "choice",
            "question": "Peking Opera is ___ old art form.",
            "options": [
              "a",
              "an",
              "the",
              "/（不填）"
            ],
            "answer": 1,
            "explanation_cn": "old 以元音音素开头，用 an。"
          },
          {
            "id": "sun-gr2",
            "type": "choice",
            "question": "The actors' faces are painted ___ different colours.",
            "options": [
              "in",
              "at",
              "of",
              "for"
            ],
            "answer": 0,
            "explanation_cn": "「用…颜色」用 in different colours。"
          },
          {
            "id": "sun-gr3",
            "type": "choice",
            "question": "Many old people love ___ TV.",
            "options": [
              "watching",
              "watch",
              "watches",
              "watched"
            ],
            "answer": 0,
            "explanation_cn": "love doing sth：喜欢看（电视）。"
          },
          {
            "id": "sun-gr4",
            "type": "choice",
            "question": "___ great the actors' moves are!",
            "options": [
              "How",
              "What",
              "Where",
              "When"
            ],
            "answer": 0,
            "explanation_cn": "How + 形容词 + 主谓：How great…!"
          },
          {
            "id": "sun-gr5",
            "type": "choice",
            "question": "An actor practises many years ___ he can sing well.",
            "options": [
              "before",
              "after",
              "because",
              "but"
            ],
            "answer": 0,
            "explanation_cn": "练很多年「才」能唱好 → before（在能唱好之前）。"
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
    "total_duration": 55,
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
        "passage": "China's high-speed trains are famous around the world. They run at about 350 kilometres per hour. A trip from Beijing to Shanghai takes only about four and a half hours by high-speed train. Ten years ago, the same trip took more than ten hours. The trains are clean, quiet and always on time. You can buy tickets with a mobile phone and get on the train without paper tickets. People from many countries come to China to learn how to build their own high-speed railways.",
        "passage_cn": "中国的高铁世界闻名。它们的时速大约是350公里。坐高铁从北京到上海只需要大约四个半小时。十年前，同样的路程要花十多个小时。高铁干净、安静，而且总是准点。你可以用手机买票，不用纸质车票就能上车。许多国家的人来中国学习如何修建自己的高速铁路。",
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
            "id": "w2-mon-rd3",
            "type": "choice",
            "question": "How long did the same trip take ten years ago?",
            "options": [
              "More than ten hours",
              "Four and a half hours",
              "Two hours",
              "Half an hour"
            ],
            "answer": 0,
            "explanation_cn": "十年前同样的路程要超过十个小时。"
          },
          {
            "id": "w2-mon-rd4",
            "type": "choice",
            "question": "What are the trains like?",
            "options": [
              "Clean, quiet and always on time",
              "Dirty and slow",
              "Noisy and crowded",
              "Old and small"
            ],
            "answer": 0,
            "explanation_cn": "文中说高铁干净、安静、总是准点。"
          },
          {
            "id": "w2-mon-rd5",
            "type": "choice",
            "question": "How can you buy a ticket now?",
            "options": [
              "With a mobile phone",
              "Only at the station",
              "From the conductor only",
              "By letter"
            ],
            "answer": 0,
            "explanation_cn": "可以用手机买票（buy tickets with a mobile phone）。"
          },
          {
            "id": "w2-mon-rd6",
            "type": "choice",
            "question": "What do people from other countries come to China to learn?",
            "options": [
              "How to build their own high-speed railways",
              "How to cook Chinese food",
              "How to make trains by hand",
              "How to drive trains fast"
            ],
            "answer": 0,
            "explanation_cn": "他们来学习如何修建自己的高速铁路。"
          },
          {
            "id": "w2-mon-rd7",
            "type": "choice",
            "question": "The word \"on time\" here means ___.",
            "options": [
              "准时",
              "提前",
              "迟到",
              "在线"
            ],
            "answer": 0,
            "explanation_cn": "on time 意思是「准时」。"
          },
          {
            "id": "w2-mon-rd8",
            "type": "choice",
            "question": "Which is NOT true about high-speed trains?",
            "options": [
              "They are often late.",
              "They are clean.",
              "They are quiet.",
              "They are fast."
            ],
            "answer": 0,
            "explanation_cn": "文中说高铁总是准点（always on time），说它们经常晚点不对。"
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
          },
          {
            "id": "w2-mon-mc5",
            "type": "choice",
            "question": "Travelling by high-speed train is ___ than by bus.",
            "options": [
              "faster",
              "fast",
              "fastest",
              "more fast"
            ],
            "answer": 0,
            "explanation_cn": "than 比较级用 faster。"
          }
        ]
      },
      {
        "id": "w2-mon-tense2",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "w2-mon-tn21",
            "type": "fill",
            "question": "The high-speed train ___ (run) at 350 kilometres per hour. [填入正确形式]",
            "answer": "runs",
            "explanation_cn": "客观事实，主语三单，用 runs。"
          },
          {
            "id": "w2-mon-tn22",
            "type": "fill",
            "question": "I ___ (take) the train to Beijing next Monday. [填入正确形式]",
            "answer": "will take",
            "explanation_cn": "next Monday 将来时间，用 will take。"
          },
          {
            "id": "w2-mon-tn23",
            "type": "fill",
            "question": "The trip ___ (take) ten hours ten years ago. [填入正确形式]",
            "answer": "took",
            "explanation_cn": "ten years ago 过去时间，用过去式 took。"
          },
          {
            "id": "w2-mon-tn24",
            "type": "fill",
            "question": "Look! The train ___ (arrive) at the station. [填入正确形式]",
            "answer": "is arriving",
            "explanation_cn": "Look! 提示正在进行，用 is arriving。"
          },
          {
            "id": "w2-mon-tn25",
            "type": "fill",
            "question": "Trains ___ (be) much faster now than before. [填入正确形式]",
            "answer": "are",
            "explanation_cn": "主语 trains 复数，now 用 are。"
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
        "passage": "The Chinese space station Tiangong is like a home in space. It flies more than 300 kilometres above the earth. Astronauts live and work there for about six months at a time. They do science experiments and even give lessons to students from space! The astronauts exercise every day, because living in space makes bones and muscles weak. They eat special space food and sleep in small sleeping bags on the wall. In 2021, Chinese astronauts gave a science lesson from Tiangong, and millions of students watched it on TV.",
        "passage_cn": "中国空间站「天宫」就像太空里的家。它在距离地球三百多公里的高空飞行。宇航员每次在那里生活和工作大约六个月。他们做科学实验，甚至还从太空给学生上课！宇航员每天都要锻炼，因为在太空生活会让骨骼和肌肉变弱。他们吃特制的太空食品，睡在墙上的小睡袋里。2021年，中国航天员在天宫上了一堂太空科学课，数百万学生通过电视观看了这堂课。",
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
            "id": "w2-tue-rd2",
            "type": "choice",
            "question": "How far does it fly above the earth?",
            "options": [
              "More than 300 kilometres",
              "More than 3000 kilometres",
              "About 30 kilometres",
              "About 3 kilometres"
            ],
            "answer": 0,
            "explanation_cn": "它在距地球三百多公里的高空飞行。"
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
            "id": "w2-tue-rd4",
            "type": "choice",
            "question": "What do astronauts do in space?",
            "options": [
              "They do science experiments and give lessons.",
              "They cook for tourists.",
              "They grow big trees.",
              "They drive cars."
            ],
            "answer": 0,
            "explanation_cn": "他们做科学实验，还从太空给学生上课。"
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
            "id": "w2-tue-rd6",
            "type": "choice",
            "question": "Where do astronauts sleep?",
            "options": [
              "In sleeping bags on the wall",
              "In big beds",
              "On the floor",
              "In chairs"
            ],
            "answer": 0,
            "explanation_cn": "他们睡在固定在墙上的睡袋里。"
          },
          {
            "id": "w2-tue-rd7",
            "type": "choice",
            "question": "When did astronauts give a science lesson from Tiangong?",
            "options": [
              "In 2021",
              "In 2012",
              "In 1990",
              "In 2024"
            ],
            "answer": 0,
            "explanation_cn": "2021年，中国航天员在天宫上了科学课。"
          },
          {
            "id": "w2-tue-rd8",
            "type": "choice",
            "question": "Who watched that lesson?",
            "options": [
              "Millions of students",
              "Only the astronauts' families",
              "Only scientists",
              "No one"
            ],
            "answer": 0,
            "explanation_cn": "数百万学生通过电视观看了太空授课。"
          },
          {
            "id": "w2-tue-rd9",
            "type": "choice",
            "question": "The word \"astronauts\" means ___.",
            "options": [
              "航天员",
              "老师",
              "农民",
              "司机"
            ],
            "answer": 0,
            "explanation_cn": "astronaut 意思是「航天员」，在空间站生活工作的人。"
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
          },
          {
            "id": "w2-tue-gr7",
            "type": "choice",
            "question": "___ a wonderful lesson it was!",
            "options": [
              "What",
              "How",
              "Where",
              "When"
            ],
            "answer": 0,
            "explanation_cn": "What + a + 形容词 + 名词：What a wonderful lesson!"
          },
          {
            "id": "w2-tue-gr8",
            "type": "choice",
            "question": "Astronauts are ___ heroes in our hearts.",
            "options": [
              "real",
              "really",
              "reality",
              "realer"
            ],
            "answer": 0,
            "explanation_cn": "名词 heroes 前用形容词 real（真正的）。"
          },
          {
            "id": "w2-tue-gr9",
            "type": "choice",
            "question": "China ___ its first space station in 2021.",
            "options": [
              "completed",
              "completes",
              "complete",
              "completing"
            ],
            "answer": 0,
            "explanation_cn": "in 2021 过去时间，用过去式 completed。"
          },
          {
            "id": "w2-tue-gr10",
            "type": "choice",
            "question": "We are proud ___ our astronauts.",
            "options": [
              "of",
              "at",
              "for",
              "with"
            ],
            "answer": 0,
            "explanation_cn": "be proud of…：为…感到自豪。"
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
          },
          {
            "id": "w2-tue-mc9",
            "type": "choice",
            "question": "Living in space makes bones ___.",
            "options": [
              "weak",
              "weakly",
              "weaker than",
              "weakest"
            ],
            "answer": 0,
            "explanation_cn": "make + 宾语 + 形容词：make bones weak。"
          },
          {
            "id": "w2-tue-mc10",
            "type": "choice",
            "question": "The astronauts must ___ every day in space.",
            "options": [
              "exercise",
              "exercises",
              "exercising",
              "exercised"
            ],
            "answer": 0,
            "explanation_cn": "must 后面用动词原形 exercise。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周三",
    "day_en": "Wednesday",
    "is_speaking_day": true,
    "total_duration": 55,
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
        "passage": "Mobile payment has changed the way Chinese people shop. Today, most people pay for things with a mobile phone. In shops, restaurants and even street markets, you just scan a QR code and the money goes to the seller in one second. Ten years ago, people carried cash everywhere and waited for change. Now many young people don't take any cash at all. Old people can learn it too — the steps are simple. Mobile payment makes shopping faster and safer, because you don't need to carry a lot of money with you.",
        "passage_cn": "移动支付改变了中国人的购物方式。如今，大多数人用手机付款。在商店、餐馆甚至街边市场，你只需要扫一下二维码，钱一秒钟就到了卖家手里。十年前，人们到处带着现金，还要等找零。现在很多年轻人根本不带现金。老人也能学会——步骤很简单。移动支付让购物更快、更安全，因为你不用随身带很多钱。",
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
            "id": "w2-wed-rd2",
            "type": "choice",
            "question": "How do most people pay today?",
            "options": [
              "With a mobile phone",
              "With cash only",
              "With bank cards only",
              "They don't pay"
            ],
            "answer": 0,
            "explanation_cn": "现在大多数人用手机付款。"
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
            "id": "w2-wed-rd4",
            "type": "choice",
            "question": "How fast does the money go to the seller?",
            "options": [
              "In one second",
              "In one day",
              "In one hour",
              "In one week"
            ],
            "answer": 0,
            "explanation_cn": "钱一秒钟就到卖家手里。"
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
            "id": "w2-wed-rd6",
            "type": "choice",
            "question": "Who can learn mobile payment?",
            "options": [
              "Everyone, because the steps are simple",
              "Only young people",
              "Only rich people",
              "Only students"
            ],
            "answer": 0,
            "explanation_cn": "步骤简单，老人也能学会。"
          },
          {
            "id": "w2-wed-rd7",
            "type": "choice",
            "question": "Why is mobile payment safer?",
            "options": [
              "Because you don't carry much money.",
              "Because it never makes mistakes.",
              "Because it is slow.",
              "Because it uses paper."
            ],
            "answer": 0,
            "explanation_cn": "不用随身带很多钱，所以更安全。"
          },
          {
            "id": "w2-wed-rd8",
            "type": "choice",
            "question": "The word \"cash\" here means ___.",
            "options": [
              "现金",
              "卡片",
              "硬币",
              "货物"
            ],
            "answer": 0,
            "explanation_cn": "cash 意思是「现金」。"
          },
          {
            "id": "w2-wed-rd9",
            "type": "choice",
            "question": "Mobile payment makes shopping ___.",
            "options": [
              "faster and safer",
              "slower and harder",
              "more expensive",
              "more difficult"
            ],
            "answer": 0,
            "explanation_cn": "最后一句：更快、更安全（faster and safer）。"
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
          },
          {
            "id": "w2-wed-mc5",
            "type": "choice",
            "question": "Now many young people don't take ___ cash.",
            "options": [
              "any",
              "some",
              "many",
              "much of"
            ],
            "answer": 0,
            "explanation_cn": "否定句用 any cash。"
          }
        ]
      },
      {
        "id": "w2-wed-tense2",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "w2-wed-tn21",
            "type": "fill",
            "question": "Most people ___ (pay) with phones in China now. [填入正确形式]",
            "answer": "pay",
            "explanation_cn": "people 复数，一般现在时用原形。"
          },
          {
            "id": "w2-wed-tn22",
            "type": "fill",
            "question": "I ___ (buy) a gift online yesterday. [填入正确形式]",
            "answer": "bought",
            "explanation_cn": "yesterday 过去时间，buy 的过去式是 bought。"
          },
          {
            "id": "w2-wed-tn23",
            "type": "fill",
            "question": "Look! The deliveryman ___ (scan) the parcel. [填入正确形式]",
            "answer": "is scanning",
            "explanation_cn": "Look! 提示正在进行，用 is scanning。"
          },
          {
            "id": "w2-wed-tn24",
            "type": "fill",
            "question": "Mobile payment ___ (be) popular for about ten years. [填入正确形式]",
            "answer": "has been",
            "explanation_cn": "for about ten years 与现在完成时连用。"
          },
          {
            "id": "w2-wed-tn25",
            "type": "fill",
            "question": "Grandma ___ (learn) to shop online next month. [填入正确形式]",
            "answer": "will learn",
            "explanation_cn": "next month 将来时间，用 will learn。"
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
            "audio_text": "People from many countries come to learn from China.",
            "options": [
              "People from many countries come to learn from China.",
              "People from many countries come to teach in China.",
              "People from my country come to learn from China.",
              "People from many countries come to travel to China only."
            ],
            "answer": 0,
            "explanation_cn": "learn from China（向中国学习），不是 teach（教）。"
          },
          {
            "id": "w2-thu-ls6",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "The space station flies more than 300 kilometres above the earth.",
            "options": [
              "The space station flies more than 300 kilometres above the earth.",
              "The space station flies more than 3000 kilometres above the earth.",
              "The space station walks more than 300 kilometres above the sea.",
              "The airplane flies more than 300 kilometres above the earth."
            ],
            "answer": 0,
            "explanation_cn": "300（三百）不是 3000；主语是 space station（空间站）。"
          },
          {
            "id": "w2-thu-ls7",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "Astronauts live and work there for about six months.",
            "options": [
              "Astronauts live and work there for about six months.",
              "Astronauts live and work there for about six weeks.",
              "Astronauts play and sleep there for about six months.",
              "Astronauts lived and worked there six years ago."
            ],
            "answer": 0,
            "explanation_cn": "six months（六个月）不是 six weeks；动词 live and work。"
          },
          {
            "id": "w2-thu-ls8",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "They eat special space food and sleep in sleeping bags.",
            "options": [
              "They eat special space food and sleep in sleeping bags.",
              "They eat special space noodles and sleep in big beds.",
              "They cook special food and sleep on the floor.",
              "They drink special juice and sleep in chairs."
            ],
            "answer": 0,
            "explanation_cn": "space food（太空食品）和 sleeping bags（睡袋）。"
          },
          {
            "id": "w2-thu-ls9",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "Millions of students watched the space lesson on TV.",
            "options": [
              "Millions of students watched the space lesson on TV.",
              "Millions of teachers watched the space lesson on TV.",
              "Millions of students played the space game on TV.",
              "Millions of students watched the space lesson on phones."
            ],
            "answer": 0,
            "explanation_cn": "观看者是 students（学生），设备是 TV（电视）。"
          },
          {
            "id": "w2-thu-ls10",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "AI can recognize faces and answer questions.",
            "options": [
              "AI can recognize faces and answer questions.",
              "AI can recognize voices and ask questions.",
              "AI can draw faces and answer questions.",
              "AI cannot recognize faces or answer questions."
            ],
            "answer": 0,
            "explanation_cn": "recognize faces（识别人脸）+ answer（回答）不是 ask（提问）。"
          }
        ]
      },
      {
        "id": "w2-thu-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "New energy cars are becoming more and more 1___ in China. They use electricity instead of petrol. They make 2___ pollution, so the air in big cities is getting 3___. The cars are also quiet. When you sit 4___ a new energy car, you can hardly hear the engine. Drivers can 5___ the cars at charging stations, just like charging a big phone. It 6___ about one hour to fill the battery. These cars are not 7___, and the government helps people buy them. In big cities, many families 8___ to buy new energy cars for their second car. More and more charging stations are 9___ up along the roads. In the future, most cars on the streets will 10___ electric ones.",
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
              "takes",
              "take",
              "taking",
              "took"
            ],
            "answer": 0,
            "explanation_cn": "it takes + 时间：花大约一小时，主语 it 三单用 takes。"
          },
          {
            "id": "w2-thu-cz7",
            "type": "choice",
            "question": "7___",
            "options": [
              "expensive",
              "cheap",
              "free",
              "fast"
            ],
            "answer": 0,
            "explanation_cn": "后面说政府补贴，说明车不「贵」，expensive。"
          },
          {
            "id": "w2-thu-cz8",
            "type": "choice",
            "question": "8___",
            "options": [
              "choose",
              "chooses",
              "choosing",
              "chose"
            ],
            "answer": 0,
            "explanation_cn": "主语 many families 复数，一般现在时用原形 choose。"
          },
          {
            "id": "w2-thu-cz9",
            "type": "choice",
            "question": "9___",
            "options": [
              "showing",
              "putting",
              "getting",
              "standing"
            ],
            "answer": 0,
            "explanation_cn": "charging stations are showing up：越来越多的充电站出现。"
          },
          {
            "id": "w2-thu-cz10",
            "type": "choice",
            "question": "10___",
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
          },
          {
            "id": "w2-thu-tn6",
            "type": "fill",
            "question": "Astronauts ___ (live) on Tiangong since June. [填入正确形式]",
            "answer": "have lived",
            "explanation_cn": "since June 与现在完成时连用：have lived。"
          },
          {
            "id": "w2-thu-tn7",
            "type": "fill",
            "question": "We ___ (watch) a space lesson next Friday. [填入正确形式]",
            "answer": "will watch",
            "explanation_cn": "next Friday 将来时间，用 will watch。"
          },
          {
            "id": "w2-thu-tn8",
            "type": "fill",
            "question": "While the train ___ (move), I read a book. [填入正确形式]",
            "answer": "was moving",
            "explanation_cn": "while 引导过去进行时：was moving。"
          },
          {
            "id": "w2-thu-tn9",
            "type": "fill",
            "question": "QR codes ___ (use) everywhere in China now. [填入正确形式]",
            "answer": "are used",
            "explanation_cn": "二维码被使用，一般现在时被动：are used。"
          },
          {
            "id": "w2-thu-tn10",
            "type": "fill",
            "question": "The engineer ___ (build) this railway for three years by last December. [填入正确形式]",
            "answer": "had built",
            "explanation_cn": "by last December 过去之前完成，用过去完成时 had built。"
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
          },
          {
            "id": "w2-fri-gr9",
            "type": "choice",
            "question": "AI helps doctors save ___ people's lives.",
            "options": [
              "many",
              "much",
              "a little",
              "a lot of"
            ],
            "answer": 0,
            "explanation_cn": "people 复数，用 many（句中 people's lives 前用 many）。"
          },
          {
            "id": "w2-fri-gr10",
            "type": "choice",
            "question": "Robots can do the same job ___ than people, without rest.",
            "options": [
              "faster",
              "fast",
              "fastest",
              "more fast"
            ],
            "answer": 0,
            "explanation_cn": "than 提示比较级 faster。"
          },
          {
            "id": "w2-fri-gr11",
            "type": "choice",
            "question": "You'd better ___ the answers before you hand them in.",
            "options": [
              "check",
              "to check",
              "checking",
              "checked"
            ],
            "answer": 0,
            "explanation_cn": "had better do sth：最好做某事，用原形 check。"
          },
          {
            "id": "w2-fri-gr12",
            "type": "choice",
            "question": "The scientists are working ___ a new space lab.",
            "options": [
              "on",
              "at",
              "in",
              "for"
            ],
            "answer": 0,
            "explanation_cn": "work on…：从事、研制某个项目。"
          },
          {
            "id": "w2-fri-gr13",
            "type": "choice",
            "question": "By 2030, China ___ more space stations in orbit.",
            "options": [
              "will have",
              "had",
              "has",
              "having"
            ],
            "answer": 0,
            "explanation_cn": "By 2030 将来时间，用一般将来时 will have。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周六",
    "day_en": "Saturday",
    "is_speaking_day": true,
    "total_duration": 55,
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
        "passage": "Artificial intelligence, or AI, is becoming a big part of our life. AI can recognize faces, translate languages and answer questions. Some students use AI tools to practise English — the AI listens and helps them correct their mistakes. In hospitals, AI helps doctors read X-ray pictures quickly. In factories, smart robots work day and night and never feel tired. But AI is not perfect. It sometimes makes mistakes, so people must check its answers. Scientists say AI is a good helper, but the most important thinking is still done by people. In the future, AI will do more and more jobs, and we should learn to work with it.",
        "passage_cn": "人工智能（AI）正在成为我们生活中重要的一部分。AI 能识别人脸、翻译语言、回答问题。一些学生用 AI 工具练习英语——AI 会听他们朗读，帮他们纠正错误。在医院，AI 帮助医生快速看X光片。在工厂里，智能机器人昼夜工作，从不觉得累。但 AI 并不完美。它有时会出错，所以人们必须检查它的答案。科学家说 AI 是好帮手，但最重要的思考仍然由人来做。未来 AI 会做越来越多工作，我们要学会与它合作。",
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
            "id": "w2-sat-rd3",
            "type": "choice",
            "question": "Where does AI help doctors?",
            "options": [
              "In hospitals",
              "In parks",
              "In shops",
              "On farms"
            ],
            "answer": 0,
            "explanation_cn": "在医院，AI 帮医生快速看X光片。"
          },
          {
            "id": "w2-sat-rd4",
            "type": "choice",
            "question": "What do smart robots do in factories?",
            "options": [
              "They work day and night.",
              "They sleep at noon.",
              "They feel tired easily.",
              "They play with children."
            ],
            "answer": 0,
            "explanation_cn": "智能机器人昼夜工作，从不觉得累。"
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
            "id": "w2-sat-rd6",
            "type": "choice",
            "question": "Who does the most important thinking?",
            "options": [
              "People",
              "Robots",
              "Computers",
              "Phones"
            ],
            "answer": 0,
            "explanation_cn": "最重要的思考仍然由人来完成。"
          },
          {
            "id": "w2-sat-rd7",
            "type": "choice",
            "question": "What should we learn to do in the future?",
            "options": [
              "Work with AI",
              "Stop using phones",
              "Sell our computers",
              "Sleep more"
            ],
            "answer": 0,
            "explanation_cn": "未来要学会与 AI 合作。"
          },
          {
            "id": "w2-sat-rd8",
            "type": "choice",
            "question": "The word \"recognize\" here means ___.",
            "options": [
              "识别",
              "涂色",
              "丢弃",
              "购买"
            ],
            "answer": 0,
            "explanation_cn": "recognize 意思是「识别、认出」。"
          },
          {
            "id": "w2-sat-rd9",
            "type": "choice",
            "question": "Which is an example of AI in the passage?",
            "options": [
              "A robot working in a factory",
              "A cat sleeping on a bed",
              "A child riding a bike",
              "A bird flying in the sky"
            ],
            "answer": 0,
            "explanation_cn": "工厂里的智能机器人是 AI 的例子。"
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
          },
          {
            "id": "w2-sat-mc5",
            "type": "choice",
            "question": "Smart robots work day and night and never feel ___.",
            "options": [
              "tired",
              "tiring",
              "tire",
              "tiredly"
            ],
            "answer": 0,
            "explanation_cn": "feel 是系动词，后面用形容词 tired（累）。"
          }
        ]
      },
      {
        "id": "w2-sat-tense2",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "w2-sat-tn21",
            "type": "fill",
            "question": "AI ___ (become) a big part of our life. [填入正确形式]",
            "answer": "is becoming",
            "explanation_cn": "正在成为，用现在进行时。"
          },
          {
            "id": "w2-sat-tn22",
            "type": "fill",
            "question": "The robot ___ (work) day and night last month. [填入正确形式]",
            "answer": "worked",
            "explanation_cn": "last month 过去时间，用过去式 worked。"
          },
          {
            "id": "w2-sat-tn23",
            "type": "fill",
            "question": "AI tools ___ (help) students since 2022. [填入正确形式]",
            "answer": "have helped",
            "explanation_cn": "since 2022 与现在完成时连用。"
          },
          {
            "id": "w2-sat-tn24",
            "type": "fill",
            "question": "Look! The AI ___ (answer) the question now. [填入正确形式]",
            "answer": "is answering",
            "explanation_cn": "Look! 提示正在进行，用 is answering。"
          },
          {
            "id": "w2-sat-tn25",
            "type": "fill",
            "question": "We ___ (work) with AI more in the future. [填入正确形式]",
            "answer": "will work",
            "explanation_cn": "in the future 将来时间，用 will work。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周日",
    "day_en": "Sunday",
    "is_speaking_day": false,
    "total_duration": 30,
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
        "passage": "Drones are small flying machines, and they are changing our 1___. A delivery company now sends parcels by drone. The drone 2___ the parcel from the sky and drops it at your door in minutes. Doctors in mountain villages also use drones to get medicine 3___. Before drones, the medicine took two days to arrive; now it 4___ only thirty minutes. Firefighters use drones to see where the fire is. Farmers use them to watch their 5___ from the sky. Drones are not very 6___, and more and more people can buy one. But there are rules: drones must not fly near 7___, and children need grown-ups 8___ them. Scientists are working 9___ bigger drones that can carry people. Maybe one day we will 10___ to school by drone taxi!",
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
              "crops",
              "crop",
              "croping",
              "cropped"
            ],
            "answer": 0,
            "explanation_cn": "农民从空中看「庄稼」，crops 复数。"
          },
          {
            "id": "w2-sun-cz6",
            "type": "choice",
            "question": "6___",
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
            "id": "w2-sun-cz7",
            "type": "choice",
            "question": "7___",
            "options": [
              "airports",
              "airport",
              "airports'",
              "the airports"
            ],
            "answer": 0,
            "explanation_cn": "禁飞区：不能在「机场」附近飞，用复数泛指 airports。"
          },
          {
            "id": "w2-sun-cz8",
            "type": "choice",
            "question": "8___",
            "options": [
              "to help",
              "help",
              "helping",
              "helped"
            ],
            "answer": 0,
            "explanation_cn": "need sb to do sth：需要大人帮忙，用 to help。"
          },
          {
            "id": "w2-sun-cz9",
            "type": "choice",
            "question": "9___",
            "options": [
              "on",
              "at",
              "in",
              "for"
            ],
            "answer": 0,
            "explanation_cn": "work on…：研制更大的无人机。"
          },
          {
            "id": "w2-sun-cz10",
            "type": "choice",
            "question": "10___",
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
        "id": "w2-sun-tense",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "w2-sun-tn1",
            "type": "fill",
            "question": "The drone ___ (carry) the parcel to our door just now. [填入正确形式]",
            "answer": "carried",
            "explanation_cn": "just now 刚才，carry 的过去式是 carried。"
          },
          {
            "id": "w2-sun-tn2",
            "type": "fill",
            "question": "Drones ___ (become) popular in the last few years. [填入正确形式]",
            "answer": "have become",
            "explanation_cn": "in the last few years 与现在完成时连用。"
          },
          {
            "id": "w2-sun-tn3",
            "type": "fill",
            "question": "Look! A drone ___ (fly) over our school. [填入正确形式]",
            "answer": "is flying",
            "explanation_cn": "Look! 提示正在进行，用 is flying。"
          },
          {
            "id": "w2-sun-tn4",
            "type": "fill",
            "question": "Farmers ___ (use) drones to watch crops every day. [填入正确形式]",
            "answer": "use",
            "explanation_cn": "every day 习惯动作，主语复数用原形 use。"
          },
          {
            "id": "w2-sun-tn5",
            "type": "fill",
            "question": "My uncle ___ (buy) a drone last month. [填入正确形式]",
            "answer": "bought",
            "explanation_cn": "last month 过去时间，buy 的过去式是 bought。"
          }
        ]
      },
      {
        "id": "w2-sun-grammar",
        "name_cn": "语法练习",
        "type": "grammar",
        "duration": 5,
        "questions": [
          {
            "id": "w2-sun-gr1",
            "type": "choice",
            "question": "Drones are small ___ that can fly.",
            "options": [
              "machines",
              "machine",
              "machining",
              "machined"
            ],
            "answer": 0,
            "explanation_cn": "machines 用复数，后面 that can fly 作定语。"
          },
          {
            "id": "w2-sun-gr2",
            "type": "choice",
            "question": "The medicine used to take two days ___ it arrives now.",
            "options": [
              "but now",
              "and now",
              "so now",
              "or now"
            ],
            "answer": 0,
            "explanation_cn": "以前要两天「但现在」30分钟，but now 表转折。"
          },
          {
            "id": "w2-sun-gr3",
            "type": "choice",
            "question": "Children need grown-ups ___ them with drones.",
            "options": [
              "to help",
              "help",
              "helping",
              "helped"
            ],
            "answer": 0,
            "explanation_cn": "need sb to do sth：需要大人帮忙。"
          },
          {
            "id": "w2-sun-gr4",
            "type": "choice",
            "question": "___ useful the drone is!",
            "options": [
              "How",
              "What",
              "Which",
              "Who"
            ],
            "answer": 0,
            "explanation_cn": "How + 形容词：How useful…!"
          },
          {
            "id": "w2-sun-gr5",
            "type": "choice",
            "question": "Drones must not fly near ___.",
            "options": [
              "airports",
              "airport's",
              "the airport of",
              "an airports"
            ],
            "answer": 0,
            "explanation_cn": "airports 复数泛指机场。"
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
    "total_duration": 55,
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
        "passage": "Online shopping is now a big part of family life in China. With a few taps on a mobile phone, people can buy clothes, food, books and even fruit from faraway farms. The things they order usually arrive in two or three days. Some big cities can deliver in half a day. If you don't like the thing you bought, you can send it back easily and get your money back. During big online shopping festivals, the prices are lower and people buy more than usual. Grandma Wang, who is seventy, also learned to shop online — now she buys vegetables for the whole family on her phone.",
        "passage_cn": "网上购物现在是中国家庭生活的重要部分。在手机上点几下，人们就能买到衣服、食品、书籍，甚至远方农场的水果。买的东西通常两三天就送到。一些大城市半天就能送达。如果你不喜欢买到的商品，可以轻松退回并拿回钱。在大型网购节期间，价格更低，人们买得比平时更多。七十岁的王奶奶也学会了网购——现在她用手机给全家买菜。",
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
            "id": "w3-mon-rd3",
            "type": "choice",
            "question": "How fast can some big cities deliver?",
            "options": [
              "In half a day",
              "In half a month",
              "In half a year",
              "In five days"
            ],
            "answer": 0,
            "explanation_cn": "一些大城市半天就能送达。"
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
            "id": "w3-mon-rd5",
            "type": "choice",
            "question": "What happens during big shopping festivals?",
            "options": [
              "The prices are lower.",
              "The shops close.",
              "The delivery stops.",
              "The phones break."
            ],
            "answer": 0,
            "explanation_cn": "购物节期间价格更低，人们买得更多。"
          },
          {
            "id": "w3-mon-rd6",
            "type": "choice",
            "question": "Who learned to shop online?",
            "options": [
              "Grandma Wang, who is seventy",
              "Only students",
              "Only workers",
              "Nobody old"
            ],
            "answer": 0,
            "explanation_cn": "七十岁的王奶奶也学会了网购。"
          },
          {
            "id": "w3-mon-rd7",
            "type": "choice",
            "question": "What does Grandma Wang buy online?",
            "options": [
              "Vegetables for the family",
              "Toys for herself",
              "Books for school",
              "Nothing"
            ],
            "answer": 0,
            "explanation_cn": "她现在用手机给全家买菜。"
          },
          {
            "id": "w3-mon-rd8",
            "type": "choice",
            "question": "The word \"deliver\" here means ___.",
            "options": [
              "送货",
              "做饭",
              "扫地",
              "上课"
            ],
            "answer": 0,
            "explanation_cn": "deliver 意思是「投递、送货」。"
          },
          {
            "id": "w3-mon-rd9",
            "type": "choice",
            "question": "The underlined word \"order\" here means ___.",
            "options": [
              "订购的东西",
              "命令",
              "顺序",
              "办公室"
            ],
            "answer": 0,
            "explanation_cn": "order 在这里是「订购的货品」。"
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
          },
          {
            "id": "w3-mon-mc5",
            "type": "choice",
            "question": "Grandma Wang learned ___ online last year.",
            "options": [
              "to shop",
              "shopping",
              "shop",
              "shops"
            ],
            "answer": 0,
            "explanation_cn": "learn to do sth：学会网购，用 to shop。"
          }
        ]
      },
      {
        "id": "w3-mon-tense2",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "w3-mon-tn21",
            "type": "fill",
            "question": "Online shopping ___ (change) our life a lot. [填入正确形式]",
            "answer": "has changed",
            "explanation_cn": "表示已经产生的影响，用现在完成时。"
          },
          {
            "id": "w3-mon-tn22",
            "type": "fill",
            "question": "Grandma Wang ___ (start) to shop online last year. [填入正确形式]",
            "answer": "started",
            "explanation_cn": "last year 过去时间，用过去式 started。"
          },
          {
            "id": "w3-mon-tn23",
            "type": "fill",
            "question": "Look! The postman ___ (deliver) the boxes. [填入正确形式]",
            "answer": "is delivering",
            "explanation_cn": "Look! 提示正在进行，用 is delivering。"
          },
          {
            "id": "w3-mon-tn24",
            "type": "fill",
            "question": "The things usually ___ (arrive) in two days. [填入正确形式]",
            "answer": "arrive",
            "explanation_cn": "usually 习惯动作，主语复数用原形。"
          },
          {
            "id": "w3-mon-tn25",
            "type": "fill",
            "question": "People ___ (buy) more during the festival next month. [填入正确形式]",
            "answer": "will buy",
            "explanation_cn": "next month 将来时间，用 will buy。"
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
        "passage": "Shared bikes are everywhere in Chinese cities. You can find them near bus stops, schools and shopping centres. To use one, you just open an app on your phone and scan the code on the bike. It costs only one yuan for thirty minutes. Shared bikes help people go the last kilometre between the bus stop and their homes. They are also good for the environment because riding a bike makes no pollution. But there is a problem: some people park the bikes in wrong places, and the streets become messy. Now the cities have new rules, and riders must park the bikes in special areas.",
        "passage_cn": "共享单车在中国城市里随处可见。在公交站、学校和购物中心附近都能找到。使用时只需打开手机App，扫一下车上的码。三十分钟只要一块钱。共享单车帮助人们解决公交站到家之间「最后一公里」。骑车不产生污染，也很环保。但也有问题：有些人把车停在错误的地方，街道变得乱糟糟。现在城市出台了新规，骑车人必须把车停到专门区域。",
        "questions": [
          {
            "id": "w3-tue-rd1",
            "type": "choice",
            "question": "Where can you find shared bikes?",
            "options": [
              "Near bus stops, schools and shopping centres",
              "Only at train stations",
              "Only in villages",
              "Inside museums"
            ],
            "answer": 0,
            "explanation_cn": "公交站、学校、购物中心附近都有。"
          },
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
            "id": "w3-tue-rd3",
            "type": "choice",
            "question": "How much does it cost for thirty minutes?",
            "options": [
              "One yuan",
              "Ten yuan",
              "One hundred yuan",
              "Nothing at all"
            ],
            "answer": 0,
            "explanation_cn": "三十分钟只要一块钱。"
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
            "id": "w3-tue-rd6",
            "type": "choice",
            "question": "What problem do shared bikes bring?",
            "options": [
              "Some people park them in wrong places.",
              "They are too fast.",
              "They cost too much.",
              "They are too heavy."
            ],
            "answer": 0,
            "explanation_cn": "问题在于乱停乱放，街道变乱。"
          },
          {
            "id": "w3-tue-rd7",
            "type": "choice",
            "question": "What must riders do now?",
            "options": [
              "Park the bikes in special areas",
              "Buy their own bikes",
              "Ride only at night",
              "Stop riding bikes"
            ],
            "answer": 0,
            "explanation_cn": "新规要求停到专门区域。"
          },
          {
            "id": "w3-tue-rd8",
            "type": "choice",
            "question": "The word \"messy\" here means ___.",
            "options": [
              "乱糟糟的",
              "干净的",
              "安静的",
              "空荡的"
            ],
            "answer": 0,
            "explanation_cn": "messy 意思是「乱的」。"
          },
          {
            "id": "w3-tue-rd9",
            "type": "choice",
            "question": "Riding a shared bike is ___ than driving a car.",
            "options": [
              "greener",
              "greenerest",
              "more green than",
              "greenest"
            ],
            "answer": 0,
            "explanation_cn": "骑车更环保，than 句子里用比较级 greener。"
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
          },
          {
            "id": "w3-tue-gr7",
            "type": "choice",
            "question": "Please put the bikes ___ after using them.",
            "options": [
              "back",
              "up",
              "off",
              "away of"
            ],
            "answer": 0,
            "explanation_cn": "put…back：把车放回原处。"
          },
          {
            "id": "w3-tue-gr8",
            "type": "choice",
            "question": "It was ___ hot day, so we rode slowly.",
            "options": [
              "a",
              "an",
              "the",
              "/（不填）"
            ],
            "answer": 0,
            "explanation_cn": "hot 辅音音素开头，用 a。"
          },
          {
            "id": "w3-tue-gr9",
            "type": "choice",
            "question": "The riders ___ park in the special area from now on.",
            "options": [
              "will",
              "wills",
              "will to",
              "will be"
            ],
            "answer": 0,
            "explanation_cn": "will 后面用动词原形 park。"
          },
          {
            "id": "w3-tue-gr10",
            "type": "choice",
            "question": "___ polite to park the bike in the right place.",
            "options": [
              "It's",
              "Its",
              "It",
              "This is"
            ],
            "answer": 0,
            "explanation_cn": "It's + 形容词 + to do：把车停对位置是有礼貌的。"
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
          },
          {
            "id": "w3-tue-mc9",
            "type": "choice",
            "question": "Don't forget ___ the bike when you arrive.",
            "options": [
              "to lock",
              "locking",
              "lock",
              "locks"
            ],
            "answer": 0,
            "explanation_cn": "forget to do sth：记得要锁车。"
          },
          {
            "id": "w3-tue-mc10",
            "type": "choice",
            "question": "Shared bikes make city life ___ easier.",
            "options": [
              "much",
              "many",
              "more",
              "most"
            ],
            "answer": 0,
            "explanation_cn": "much 修饰比较级 easier。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周三",
    "day_en": "Wednesday",
    "is_speaking_day": true,
    "total_duration": 55,
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
        "passage": "Short videos are very popular now, and some teachers use them to help students learn. In one popular kind of video, a teacher explains a maths problem in just one minute. Students can watch it again and again until they understand. Many museums also make short videos to show their treasures, so children can enjoy them at home. But watching too many short videos is bad for the eyes, and some videos are not useful at all. Doctors say students should watch screens for less than two hours a day. The best way is to pick good videos, watch for a short time, and then go outside to play.",
        "passage_cn": "短视频现在非常流行，一些老师用它们帮助学生学习。在一种热门视频里，老师只用一分钟讲解一道数学题。学生可以反复观看，直到看懂为止。很多博物馆也拍短视频展示馆藏珍宝，孩子们在家就能欣赏。但看太多短视频伤眼睛，而且有些视频完全没用。医生建议学生每天看屏幕不要超过两小时。最好的办法是：挑好视频、短时间观看，然后出门去玩。",
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
            "id": "w3-wed-rd2",
            "type": "choice",
            "question": "How long does the maths video take?",
            "options": [
              "One minute",
              "One hour",
              "One day",
              "Ten seconds"
            ],
            "answer": 0,
            "explanation_cn": "老师只用一分钟讲一道数学题。"
          },
          {
            "id": "w3-wed-rd3",
            "type": "choice",
            "question": "What can students do if they don't understand?",
            "options": [
              "Watch the video again and again",
              "Do nothing",
              "Buy a new phone",
              "Stop learning"
            ],
            "answer": 0,
            "explanation_cn": "可以反复观看直到看懂。"
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
            "id": "w3-wed-rd5",
            "type": "choice",
            "question": "What is bad about watching too many short videos?",
            "options": [
              "It is bad for the eyes.",
              "It makes people taller.",
              "It costs a lot of money.",
              "It is too slow."
            ],
            "answer": 0,
            "explanation_cn": "看太多伤眼睛。"
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
            "id": "w3-wed-rd7",
            "type": "choice",
            "question": "What is the best way to watch short videos?",
            "options": [
              "Pick good ones, watch for a short time, then go outside",
              "Watch all night",
              "Only watch funny ones",
              "Never watch any"
            ],
            "answer": 0,
            "explanation_cn": "最后一句：挑好视频、短时间看，再出去玩。"
          },
          {
            "id": "w3-wed-rd8",
            "type": "choice",
            "question": "The word \"treasures\" here means ___.",
            "options": [
              "珍宝",
              "垃圾",
              "门票",
              "桌椅"
            ],
            "answer": 0,
            "explanation_cn": "treasures 意思是「珍宝」，指博物馆里的文物。"
          },
          {
            "id": "w3-wed-rd9",
            "type": "choice",
            "question": "Which one is NOT talked about in the short video passage?",
            "options": [
              "Short videos can cook dinner.",
              "Teachers use short videos.",
              "Museums make short videos.",
              "Too many videos hurt eyes."
            ],
            "answer": 0,
            "explanation_cn": "短视频不能做饭，其余三项都在文中。"
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
          },
          {
            "id": "w3-wed-mc5",
            "type": "choice",
            "question": "Watching too many videos is bad ___ the eyes.",
            "options": [
              "for",
              "at",
              "with",
              "of"
            ],
            "answer": 0,
            "explanation_cn": "be bad for…：对…有害。"
          }
        ]
      },
      {
        "id": "w3-wed-tense2",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "w3-wed-tn21",
            "type": "fill",
            "question": "Short videos ___ (be) very popular now. [填入正确形式]",
            "answer": "are",
            "explanation_cn": "videos 复数，now 用 are。"
          },
          {
            "id": "w3-wed-tn22",
            "type": "fill",
            "question": "The teacher ___ (explain) the problem in one minute yesterday. [填入正确形式]",
            "answer": "explained",
            "explanation_cn": "yesterday 过去时间，用过去式 explained。"
          },
          {
            "id": "w3-wed-tn23",
            "type": "fill",
            "question": "Look! The kids ___ (watch) a science video. [填入正确形式]",
            "answer": "are watching",
            "explanation_cn": "Look! 提示正在进行，用 are watching。"
          },
          {
            "id": "w3-wed-tn24",
            "type": "fill",
            "question": "Museums ___ (make) short videos since 2020. [填入正确形式]",
            "answer": "have made",
            "explanation_cn": "since 2020 与现在完成时连用。"
          },
          {
            "id": "w3-wed-tn25",
            "type": "fill",
            "question": "We ___ (pick) good videos and watch less from today. [填入正确形式]",
            "answer": "will pick",
            "explanation_cn": "from today 表示从今往后，用 will pick。"
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
            "audio_text": "It costs one yuan for thirty minutes.",
            "options": [
              "It costs one yuan for thirty minutes.",
              "It costs ten yuan for thirty minutes.",
              "It costs one yuan for thirteen minutes.",
              "It takes one yuan for thirty minutes."
            ],
            "answer": 0,
            "explanation_cn": "价格是 one yuan（一元），时间 thirty minutes；costs 不是 takes。"
          },
          {
            "id": "w3-thu-ls6",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "Some people park the bikes in wrong places.",
            "options": [
              "Some people park the bikes in wrong places.",
              "Some people ride the bikes in wrong places.",
              "All people park the bikes in right places.",
              "Some people paint the bikes in wrong places."
            ],
            "answer": 0,
            "explanation_cn": "park（停放）不是 ride（骑）；wrong places（错误地方）。"
          },
          {
            "id": "w3-thu-ls7",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "Students should watch screens for less than two hours a day.",
            "options": [
              "Students should watch screens for less than two hours a day.",
              "Students should watch screens for more than two hours a day.",
              "Students should watch films for less than two hours a day.",
              "Teachers should watch screens for less than two hours a day."
            ],
            "answer": 0,
            "explanation_cn": "less than（少于）不是 more than；对象是 students。"
          },
          {
            "id": "w3-thu-ls8",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "The museum uses lights and big screens to show old things.",
            "options": [
              "The museum uses lights and big screens to show old things.",
              "The museum uses lights and big screens to sell old things.",
              "The library uses lights and big screens to show old things.",
              "The museum uses candles and paper to show old things."
            ],
            "answer": 0,
            "explanation_cn": "lights and big screens（灯光和大屏幕），动词 show。"
          },
          {
            "id": "w3-thu-ls9",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "Young people like sharing museum photos online.",
            "options": [
              "Young people like sharing museum photos online.",
              "Young people like drawing museum photos online.",
              "Old people like sharing museum photos online.",
              "Young people like sharing school photos online."
            ],
            "answer": 0,
            "explanation_cn": "like sharing（喜欢分享），地点 online（网上）。"
          },
          {
            "id": "w3-thu-ls10",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "The doctors say watching too many videos hurts the eyes.",
            "options": [
              "The doctors say watching too many videos hurts the eyes.",
              "The doctors say watching too many videos helps the eyes.",
              "The teacher says reading too many books hurts the eyes.",
              "The doctors say watching too many films hurts the ears."
            ],
            "answer": 0,
            "explanation_cn": "hurts（伤害）不是 helps；伤的是 eyes（眼睛）。"
          }
        ]
      },
      {
        "id": "w3-thu-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "Garbage sorting is an important habit in Chinese cities now. In Shanghai and many other cities, people must 1___ their garbage into four kinds: dry, wet, recyclable and harmful. Kitchen waste like banana skins is 2___ garbage. Bottles, paper and old clothes are 3___, because they can be made into new things. Batteries and old medicine are 4___ garbage, so we need 5___ care with them. At first, many people found 6___ hard to remember the four kinds, but now most people do it well. Some neighborhoods give small 7___ to people who sort well, like soap and eggs. Children also learn sorting at 8___ and teach their parents at home. Sorting garbage 9___ only one minute every day, but it helps the earth a lot. If everyone takes part, our cities will become 10___ cleaner and more beautiful.",
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
              "it",
              "them",
              "its",
              "they"
            ],
            "answer": 0,
            "explanation_cn": "found it hard to do sth：it 作形式宾语。"
          },
          {
            "id": "w3-thu-cz7",
            "type": "choice",
            "question": "7___",
            "options": [
              "gifts",
              "gift",
              "gifts'",
              "a gift"
            ],
            "answer": 0,
            "explanation_cn": "some gifts：一些小礼物，用复数。"
          },
          {
            "id": "w3-thu-cz8",
            "type": "choice",
            "question": "8___",
            "options": [
              "school",
              "schools'",
              "the school of",
              "schooling"
            ],
            "answer": 0,
            "explanation_cn": "「在学校」at school，固定搭配。"
          },
          {
            "id": "w3-thu-cz9",
            "type": "choice",
            "question": "9___",
            "options": [
              "takes",
              "take",
              "taking",
              "took"
            ],
            "answer": 0,
            "explanation_cn": "动名词短语作主语按单数算，takes。"
          },
          {
            "id": "w3-thu-cz10",
            "type": "choice",
            "question": "10___",
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
          },
          {
            "id": "w3-thu-tn6",
            "type": "fill",
            "question": "Bottles ___ (make) into new things every day. [填入正确形式]",
            "answer": "are made",
            "explanation_cn": "瓶子被做成新东西，一般现在时被动 are made。"
          },
          {
            "id": "w3-thu-tn7",
            "type": "fill",
            "question": "I ___ (finish) sorting before mom came home. [填入正确形式]",
            "answer": "had finished",
            "explanation_cn": "mom 回来之前已完成，用过去完成时 had finished。"
          },
          {
            "id": "w3-thu-tn8",
            "type": "fill",
            "question": "Tomorrow our class ___ (visit) the recycling centre. [填入正确形式]",
            "answer": "will visit",
            "explanation_cn": "tomorrow 将来时间，用 will visit。"
          },
          {
            "id": "w3-thu-tn9",
            "type": "fill",
            "question": "While dad ___ (clean) the kitchen, I sorted the bottles. [填入正确形式]",
            "answer": "was cleaning",
            "explanation_cn": "while 引导过去进行时：was cleaning。"
          },
          {
            "id": "w3-thu-tn10",
            "type": "fill",
            "question": "Don't forget ___ (wash) your hands after sorting. [填入正确形式]",
            "answer": "to wash",
            "explanation_cn": "remember/forget to do sth：别忘了洗手。"
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
          },
          {
            "id": "w3-fri-gr9",
            "type": "choice",
            "question": "Not all short videos ___ good for children.",
            "options": [
              "are",
              "is",
              "was",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "videos 复数，主语是 Not all…，用 are。"
          },
          {
            "id": "w3-fri-gr10",
            "type": "choice",
            "question": "The teacher asked us ___ too much time on videos.",
            "options": [
              "not to spend",
              "don't spend",
              "not spending",
              "to not spend"
            ],
            "answer": 0,
            "explanation_cn": "ask sb not to do sth：叫我们别花太多时间。"
          },
          {
            "id": "w3-fri-gr11",
            "type": "choice",
            "question": "By the time we arrived, the museum tickets ___ sold out.",
            "options": [
              "had been",
              "have been",
              "were being",
              "are"
            ],
            "answer": 0,
            "explanation_cn": "到达之前已卖完，过去完成时 had been。"
          },
          {
            "id": "w3-fri-gr12",
            "type": "choice",
            "question": "The number of museum visitors ___ growing every year.",
            "options": [
              "is",
              "are",
              "were",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "the number of… 作主语按单数，is growing。"
          },
          {
            "id": "w3-fri-gr13",
            "type": "choice",
            "question": "Remember ___ your own bag when you go shopping.",
            "options": [
              "to take",
              "taking",
              "take",
              "takes"
            ],
            "answer": 0,
            "explanation_cn": "remember to do sth：记得自带购物袋。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周六",
    "day_en": "Saturday",
    "is_speaking_day": true,
    "total_duration": 55,
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
        "passage": "More and more young people love visiting museums in China. On weekends, many museums are full of students and families. Some famous museums are so popular that people must book tickets days before. Why are museums hot now? First, museums look more beautiful and friendly than before. Many of them use lights, sounds and big screens to show old things in new ways. Second, museums make lovely ice cream, books and toys with pictures of their treasures. Third, taking photos in museums is fun, and young people like sharing them online. Museums are no longer quiet and boring places — they are becoming the most fashionable classrooms in China.",
        "passage_cn": "在中国，越来越多的年轻人喜欢参观博物馆。周末许多博物馆满是学生和家庭。一些著名博物馆太火了，人们要提前好几天预约门票。为什么博物馆现在这么火？第一，博物馆比以前更漂亮、更亲民。很多用灯光、声音和大屏幕，用新方式展示古老文物。第二，博物馆用馆藏形象做出可爱的冰淇淋、书和玩具。第三，在博物馆拍照很好玩，年轻人喜欢把照片分享到网上。博物馆不再是安静无聊的地方——它们正成为中国最时髦的课堂。",
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
            "id": "w3-sat-rd2",
            "type": "choice",
            "question": "What must people do for famous museums?",
            "options": [
              "Book tickets days before",
              "Pay a lot of money",
              "Wear special clothes",
              "Take an exam"
            ],
            "answer": 0,
            "explanation_cn": "热门博物馆要提前几天预约。"
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
            "id": "w3-sat-rd5",
            "type": "choice",
            "question": "What do young people like doing in museums?",
            "options": [
              "Taking photos and sharing them online",
              "Sleeping on benches",
              "Running and shouting",
              "Cooking dinner"
            ],
            "answer": 0,
            "explanation_cn": "拍照并分享到网上。"
          },
          {
            "id": "w3-sat-rd6",
            "type": "choice",
            "question": "What were museums like before?",
            "options": [
              "Quiet and boring",
              "Noisy and crowded",
              "Full of games",
              "Closed all day"
            ],
            "answer": 0,
            "explanation_cn": "最后说博物馆「不再」安静无聊，说明以前是那样。"
          },
          {
            "id": "w3-sat-rd7",
            "type": "choice",
            "question": "The passage calls museums the most fashionable ___.",
            "options": [
              "classrooms",
              "playgrounds",
              "cinemas",
              "restaurants"
            ],
            "answer": 0,
            "explanation_cn": "最后一句：最时髦的课堂（classrooms）。"
          },
          {
            "id": "w3-sat-rd8",
            "type": "choice",
            "question": "The word \"book\" in \"book tickets\" means ___.",
            "options": [
              "预约",
              "书本",
              "账本",
              "书店"
            ],
            "answer": 0,
            "explanation_cn": "这里的 book 是动词「预订」。"
          },
          {
            "id": "w3-sat-rd9",
            "type": "choice",
            "question": "How many reasons does the passage give?",
            "options": [
              "Three",
              "Two",
              "Four",
              "Five"
            ],
            "answer": 0,
            "explanation_cn": "First、Second、Third — 共三个原因。"
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
          },
          {
            "id": "w3-sat-mc5",
            "type": "choice",
            "question": "The museums make lovely toys ___ pictures of treasures.",
            "options": [
              "with",
              "in",
              "at",
              "of"
            ],
            "answer": 0,
            "explanation_cn": "「带有…图案的」玩具，用 with。"
          }
        ]
      },
      {
        "id": "w3-sat-tense2",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "w3-sat-tn21",
            "type": "fill",
            "question": "More and more people ___ (visit) museums every year. [填入正确形式]",
            "answer": "visit",
            "explanation_cn": "every year 习惯动作，主语复数用原形。"
          },
          {
            "id": "w3-sat-tn22",
            "type": "fill",
            "question": "The museum ___ (open) a new hall last month. [填入正确形式]",
            "answer": "opened",
            "explanation_cn": "last month 过去时间，用过去式 opened。"
          },
          {
            "id": "w3-sat-tn23",
            "type": "fill",
            "question": "Look! The students ___ (take) photos of the treasures. [填入正确形式]",
            "answer": "are taking",
            "explanation_cn": "Look! 提示正在进行，用 are taking。"
          },
          {
            "id": "w3-sat-tn24",
            "type": "fill",
            "question": "Museums ___ (become) the fashionable classrooms already. [填入正确形式]",
            "answer": "have become",
            "explanation_cn": "already 与现在完成时连用。"
          },
          {
            "id": "w3-sat-tn25",
            "type": "fill",
            "question": "Our class ___ (go) to the museum next Saturday. [填入正确形式]",
            "answer": "will go",
            "explanation_cn": "next Saturday 将来时间，用 will go。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周日",
    "day_en": "Sunday",
    "is_speaking_day": false,
    "total_duration": 30,
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
        "passage": "More and more people in China love running, and city marathon races are everywhere now. Every year, big cities like Beijing and Shanghai hold marathon 1___. Tens of thousands of people join them. Runners wear sports 2___ and numbers on their backs. The race 3___ about forty-two kilometres, and it usually starts early in the morning. Many people are not fast, 4___ they keep running to the end. Doctors and volunteers stand along the 5___ to help. Water and fruit are 6___ at rest points every few kilometres. Running is good 7___ the heart, and it also makes people feel happy. Children can join the short 8___, maybe three kilometres. To run well, you must 9___ every day for months before the race. Marathon is not just a race — it is a 10___ of never giving up.",
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
              "clothes",
              "cloths",
              "clothing of",
              "cloths'"
            ],
            "answer": 0,
            "explanation_cn": "运动服装 clothes，本身就是复数形式。"
          },
          {
            "id": "w3-sun-cz3",
            "type": "choice",
            "question": "3___",
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
            "id": "w3-sun-cz4",
            "type": "choice",
            "question": "4___",
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
            "id": "w3-sun-cz5",
            "type": "choice",
            "question": "5___",
            "options": [
              "way",
              "road of",
              "ways",
              "roadside of"
            ],
            "answer": 0,
            "explanation_cn": "along the way：沿路。"
          },
          {
            "id": "w3-sun-cz6",
            "type": "choice",
            "question": "6___",
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
            "id": "w3-sun-cz7",
            "type": "choice",
            "question": "7___",
            "options": [
              "for",
              "at",
              "with",
              "of"
            ],
            "answer": 0,
            "explanation_cn": "be good for the heart：对心脏有好处。"
          },
          {
            "id": "w3-sun-cz8",
            "type": "choice",
            "question": "8___",
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
            "id": "w3-sun-cz9",
            "type": "choice",
            "question": "9___",
            "options": [
              "practise",
              "practises",
              "practising",
              "practised"
            ],
            "answer": 0,
            "explanation_cn": "must 后面用动词原形 practise。"
          },
          {
            "id": "w3-sun-cz10",
            "type": "choice",
            "question": "10___",
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
        "id": "w3-sun-tense",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "w3-sun-tn1",
            "type": "fill",
            "question": "Our city ___ (hold) a marathon race last autumn. [填入正确形式]",
            "answer": "held",
            "explanation_cn": "last autumn 过去时间，hold 的过去式是 held。"
          },
          {
            "id": "w3-sun-tn2",
            "type": "fill",
            "question": "Look! The runners ___ (pass) our street now. [填入正确形式]",
            "answer": "are passing",
            "explanation_cn": "Look! 提示正在进行，用 are passing。"
          },
          {
            "id": "w3-sun-tn3",
            "type": "fill",
            "question": "Running ___ (be) good for the heart. [填入正确形式]",
            "answer": "is",
            "explanation_cn": "动名词作主语按单数，用 is。"
          },
          {
            "id": "w3-sun-tn4",
            "type": "fill",
            "question": "My uncle ___ (run) marathons since 2020. [填入正确形式]",
            "answer": "has run",
            "explanation_cn": "since 2020 与现在完成时连用，run 的过去分词是 run。"
          },
          {
            "id": "w3-sun-tn5",
            "type": "fill",
            "question": "The volunteers ___ (give) out water at every rest point tomorrow. [填入正确形式]",
            "answer": "will give",
            "explanation_cn": "tomorrow 将来时间，用 will give。"
          }
        ]
      },
      {
        "id": "w3-sun-grammar",
        "name_cn": "语法练习",
        "type": "grammar",
        "duration": 5,
        "questions": [
          {
            "id": "w3-sun-gr1",
            "type": "choice",
            "question": "Tens of thousands ___ people join the race.",
            "options": [
              "of",
              "off",
              "for",
              "with"
            ],
            "answer": 0,
            "explanation_cn": "tens of thousands of people：数以万计的人。"
          },
          {
            "id": "w3-sun-gr2",
            "type": "choice",
            "question": "The runners wear numbers ___ their backs.",
            "options": [
              "on",
              "in",
              "at",
              "under"
            ],
            "answer": 0,
            "explanation_cn": "「背在背上」用 on their backs。"
          },
          {
            "id": "w3-sun-gr3",
            "type": "choice",
            "question": "Keep ___ and you will reach the end.",
            "options": [
              "running",
              "run",
              "runs",
              "ran"
            ],
            "answer": 0,
            "explanation_cn": "keep doing sth：坚持跑下去。"
          },
          {
            "id": "w3-sun-gr4",
            "type": "choice",
            "question": "Marathon is a lesson of never ___ up.",
            "options": [
              "giving",
              "give",
              "gives",
              "gave"
            ],
            "answer": 0,
            "explanation_cn": "of 后面用动名词 giving up。"
          },
          {
            "id": "w3-sun-gr5",
            "type": "choice",
            "question": "___ exciting the marathon finish is!",
            "options": [
              "How",
              "What",
              "Where",
              "When"
            ],
            "answer": 0,
            "explanation_cn": "How + 形容词：How exciting…!"
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
    "total_duration": 55,
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
        "passage": "The Palace Museum, also known as the Forbidden City, stands in the heart of Beijing. Emperors of the Ming and Qing dynasties lived and worked there for almost 500 years. The palace has about 9000 rooms, and the buildings are made of wood without a single nail. Red walls and golden roofs shine under the blue sky. Today it is one of the most popular museums in the world, and over seventeen million people visit it every year. The museum now uses apps and online tours, so people can enjoy the palace without leaving home. On snowy days, photos of the red palace in white snow spread quickly on the internet, and people say it becomes the Forbidden City of six hundred years ago again.",
        "passage_cn": "故宫博物院，又叫紫禁城，坐落在北京市中心。明清两代的皇帝在这里生活、理政近五百年。故宫有大约九千间房，建筑全部用木头建成，不用一根钉子。红墙金瓦在蓝天下闪闪发光。今天它是世界上最受欢迎的博物馆之一，每年有一千七百多万人前来参观。故宫现在还推出了App和线上游览，人们足不出户也能欣赏故宫。下雪天，红墙白雪的照片在网上迅速传播，人们说它又变成了六百年前的紫禁城。",
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
            "id": "w4-mon-rd2",
            "type": "choice",
            "question": "Who lived in the Forbidden City?",
            "options": [
              "Emperors of the Ming and Qing dynasties",
              "Kings of England",
              "Famous scientists",
              "Ancient fighters"
            ],
            "answer": 0,
            "explanation_cn": "明清两代的皇帝在这里生活理政。"
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
            "id": "w4-mon-rd4",
            "type": "choice",
            "question": "How many rooms does the palace have?",
            "options": [
              "About 9000",
              "About 900",
              "About 90000",
              "About 90"
            ],
            "answer": 0,
            "explanation_cn": "大约九千间房。"
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
            "id": "w4-mon-rd6",
            "type": "choice",
            "question": "How many people visit the museum every year?",
            "options": [
              "Over seventeen million",
              "Over seven thousand",
              "Over seventy thousand",
              "Over seven million"
            ],
            "answer": 0,
            "explanation_cn": "每年超过一千七百万人参观。"
          },
          {
            "id": "w4-mon-rd7",
            "type": "choice",
            "question": "How can people enjoy the palace without leaving home?",
            "options": [
              "Through apps and online tours",
              "By reading letters",
              "By watching films only",
              "They can't"
            ],
            "answer": 0,
            "explanation_cn": "用App和线上游览。"
          },
          {
            "id": "w4-mon-rd8",
            "type": "choice",
            "question": "What happens on snowy days?",
            "options": [
              "Photos of the red palace spread quickly online.",
              "The palace closes early.",
              "People stop visiting.",
              "The roofs turn white forever."
            ],
            "answer": 0,
            "explanation_cn": "雪天红墙白雪的照片在网上迅速传播。"
          },
          {
            "id": "w4-mon-rd9",
            "type": "choice",
            "question": "The word \"nail\" here means ___.",
            "options": [
              "钉子",
              "指甲",
              "门钉",
              "锤子"
            ],
            "answer": 0,
            "explanation_cn": "nail 在建筑里指「钉子」。"
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
          },
          {
            "id": "w4-mon-mc5",
            "type": "choice",
            "question": "Over seventeen ___ people visit it every year.",
            "options": [
              "million",
              "millions",
              "million of",
              "millions of"
            ],
            "answer": 0,
            "explanation_cn": "数词 + million 单数：seventeen million。"
          }
        ]
      },
      {
        "id": "w4-mon-tense2",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "w4-mon-tn21",
            "type": "fill",
            "question": "Emperors ___ (live) there for almost 500 years. [填入正确形式]",
            "answer": "lived",
            "explanation_cn": "for almost 500 years 过去时间段，用过去式 lived。"
          },
          {
            "id": "w4-mon-tn22",
            "type": "fill",
            "question": "Look! Visitors ___ (take) photos of the red walls. [填入正确形式]",
            "answer": "are taking",
            "explanation_cn": "Look! 提示正在进行，用 are taking。"
          },
          {
            "id": "w4-mon-tn23",
            "type": "fill",
            "question": "The museum ___ (use) apps for a few years. [填入正确形式]",
            "answer": "has used",
            "explanation_cn": "for a few years 与现在完成时连用。"
          },
          {
            "id": "w4-mon-tn24",
            "type": "fill",
            "question": "The photos ___ (spread) quickly online last night. [填入正确形式]",
            "answer": "spread",
            "explanation_cn": "last night 过去时间，spread 的过去式还是 spread。"
          },
          {
            "id": "w4-mon-tn25",
            "type": "fill",
            "question": "More people ___ (visit) the palace next year. [填入正确形式]",
            "answer": "will visit",
            "explanation_cn": "next year 将来时间，用 will visit。"
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
        "passage": "Chang'e is the name of China's moon exploration programme, taken from a goddess in an old Chinese story. In 2020, Chang'e-5 flew to the moon, collected moon soil and brought it back to the earth. It was the first time in over forty years that any country had brought moon rocks home. In 2024, Chang'e-6 did something even more amazing — it brought back soil from the far side of the moon, the side we can never see from the earth. Chinese scientists also sent a small robot car to drive on the moon and take photos. The moon soil helps scientists learn how the moon was born. One day, Chinese astronauts may walk on the moon and build a moon research station, and children watching today may become the builders of tomorrow.",
        "passage_cn": "「嫦娥」是中国探月工程的名字，取自古代神话里的仙女。2020年，嫦娥五号飞向月球，采集月壤并带回地球。这是四十多年来人类首次把月岩带回。2024年，嫦娥六号完成了一项更了不起的任务——带回了月球背面的土壤，那是我们从地球上永远看不到的一面。中国科学家还把一台小小的月球车送上月球，在月面行驶拍照。月壤帮助科学家研究月球是怎样诞生的。将来某一天，中国航天员也许会在月面行走、建立月球科研站，今天观看发射的孩子们，可能就是明天的建设者。",
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
            "id": "w4-tue-rd3",
            "type": "choice",
            "question": "How long had it been since moon rocks were last brought home?",
            "options": [
              "Over forty years",
              "Over four years",
              "Over fourteen years",
              "Over four hundred years"
            ],
            "answer": 0,
            "explanation_cn": "这是四十多年来人类首次。"
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
            "id": "w4-tue-rd5",
            "type": "choice",
            "question": "What can we see from the earth?",
            "options": [
              "Only one side of the moon",
              "Both sides of the moon",
              "No side of the moon",
              "The inside of the moon"
            ],
            "answer": 0,
            "explanation_cn": "月球背面是我们从地球上永远看不到的一面。"
          },
          {
            "id": "w4-tue-rd6",
            "type": "choice",
            "question": "What did the small robot car do on the moon?",
            "options": [
              "It drove around and took photos.",
              "It built a house.",
              "It planted flowers.",
              "It played football."
            ],
            "answer": 0,
            "explanation_cn": "月球车在月面行驶、拍照。"
          },
          {
            "id": "w4-tue-rd7",
            "type": "choice",
            "question": "Why is moon soil important?",
            "options": [
              "It helps scientists learn how the moon was born.",
              "It can be sold for money.",
              "It makes plants grow fast.",
              "It is used to build roads."
            ],
            "answer": 0,
            "explanation_cn": "月壤帮助科学家研究月球的诞生。"
          },
          {
            "id": "w4-tue-rd8",
            "type": "choice",
            "question": "What may happen one day?",
            "options": [
              "Chinese astronauts may build a moon research station.",
              "Astronauts may live on the sun.",
              "The moon may fly away.",
              "Chang'e may come back as a goddess."
            ],
            "answer": 0,
            "explanation_cn": "将来中国航天员也许会建月球科研站。"
          },
          {
            "id": "w4-tue-rd9",
            "type": "choice",
            "question": "The word \"exploration\" here means ___.",
            "options": [
              "探测、探索",
              "爆炸",
              "旅游",
              "种植"
            ],
            "answer": 0,
            "explanation_cn": "exploration 意思是「探索、探测」。"
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
          },
          {
            "id": "w4-tue-gr7",
            "type": "choice",
            "question": "Astronauts must keep ___ in space, too.",
            "options": [
              "healthy",
              "health",
              "healthly",
              "healthful"
            ],
            "answer": 0,
            "explanation_cn": "keep + 形容词：保持健康。"
          },
          {
            "id": "w4-tue-gr8",
            "type": "choice",
            "question": "The launch was shown ___ TV all over the world.",
            "options": [
              "on",
              "in",
              "at",
              "by"
            ],
            "answer": 0,
            "explanation_cn": "「在电视上」用 on TV。"
          },
          {
            "id": "w4-tue-gr9",
            "type": "choice",
            "question": "Everyone watched the rocket ___ into the sky.",
            "options": [
              "fly",
              "flew",
              "flying",
              "to fly"
            ],
            "answer": 0,
            "explanation_cn": "watch sth do sth：看火箭飞上天空，用原形 fly（强调全过程）。"
          },
          {
            "id": "w4-tue-gr10",
            "type": "choice",
            "question": "The children dream of ___ on the moon one day.",
            "options": [
              "walking",
              "walk",
              "walks",
              "walked"
            ],
            "answer": 0,
            "explanation_cn": "dream of doing sth：梦想在月球上行走。"
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
          },
          {
            "id": "w4-tue-mc9",
            "type": "choice",
            "question": "The mission was ___ success.",
            "options": [
              "a",
              "an",
              "the",
              "/（不填）"
            ],
            "answer": 0,
            "explanation_cn": "a success：一件成功的事，success 可数时用 a。"
          },
          {
            "id": "w4-tue-mc10",
            "type": "choice",
            "question": "We are proud ___ Chang'e.",
            "options": [
              "of",
              "with",
              "at",
              "for"
            ],
            "answer": 0,
            "explanation_cn": "be proud of…：为嫦娥感到骄傲。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周三",
    "day_en": "Wednesday",
    "is_speaking_day": true,
    "total_duration": 55,
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
        "passage": "C919 is China's first big passenger plane made by itself. The letter C stands for China, and 919 sounds like \"jiu jiu\" in Chinese, which means a long, long time — people hope the plane will fly safely forever. The plane can carry about 160 passengers and fly over five thousand kilometres without stopping. Its first passenger flight was in May 2023, from Shanghai to Beijing. Many parts of the plane, like the wings and the body, are made in Chinese factories. Sitting inside, passengers find wide seats, big windows and quiet engines. More and more airlines are choosing C919 for busy lines between big cities. The sky used to belong to planes from other countries, but now China has its own big plane, and it is flying higher and higher.",
        "passage_cn": "C919是中国自主制造的第一架大型客机。字母C代表中国，919在中文里谐音「久久」，寓意长长久久——人们希望这架飞机永远安全飞行。这架飞机可以载约160名乘客，不休息能飞五千多公里。它的首次商业飞行在2023年5月，从上海到北京。飞机的机翼、机身等许多部件都是中国工厂制造的。坐在里面，乘客能看到宽大的座椅、大窗户和安静的发动机。越来越多的航空公司选择C919执飞大城市之间的繁忙航线。天空曾经属于别国的飞机，现在中国有了自己的大飞机，而且飞得越来越高。",
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
            "id": "w4-wed-rd2",
            "type": "choice",
            "question": "What does 919 sound like in Chinese?",
            "options": [
              "\"Jiu jiu\", meaning a long, long time",
              "\"Jiu wu\", meaning save me",
              "\"Yi jiu\", meaning first",
              "Nothing special"
            ],
            "answer": 0,
            "explanation_cn": "919 谐音「久久」，寓意长长久久。"
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
            "id": "w4-wed-rd4",
            "type": "choice",
            "question": "How far can it fly without stopping?",
            "options": [
              "Over five thousand kilometres",
              "Over five hundred kilometres",
              "Over fifty kilometres",
              "Over five kilometres"
            ],
            "answer": 0,
            "explanation_cn": "不休息能飞五千多公里。"
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
            "id": "w4-wed-rd6",
            "type": "choice",
            "question": "Where was the first flight from and to?",
            "options": [
              "From Shanghai to Beijing",
              "From Beijing to Shanghai",
              "From Shanghai to Guangzhou",
              "From Chengdu to Beijing"
            ],
            "answer": 0,
            "explanation_cn": "首航从上海到北京。"
          },
          {
            "id": "w4-wed-rd7",
            "type": "choice",
            "question": "What are the seats like?",
            "options": [
              "Wide",
              "Narrow",
              "Hard",
              "Small and dark"
            ],
            "answer": 0,
            "explanation_cn": "乘客发现座椅宽大。"
          },
          {
            "id": "w4-wed-rd8",
            "type": "choice",
            "question": "Who is choosing C919 for busy lines?",
            "options": [
              "More and more airlines",
              "No one yet",
              "Only foreign airlines",
              "Only the army"
            ],
            "answer": 0,
            "explanation_cn": "越来越多航空公司选择C919。"
          },
          {
            "id": "w4-wed-rd9",
            "type": "choice",
            "question": "The word \"passenger\" here means ___.",
            "options": [
              "乘客",
              "飞行员",
              "司机",
              "工程师"
            ],
            "answer": 0,
            "explanation_cn": "passenger 意思是「乘客」。"
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
          },
          {
            "id": "w4-wed-mc5",
            "type": "choice",
            "question": "Passengers find wide seats and ___ windows.",
            "options": [
              "big",
              "small",
              "broken",
              "dark"
            ],
            "answer": 0,
            "explanation_cn": "宽大的座椅、大窗户，big windows。"
          }
        ]
      },
      {
        "id": "w4-wed-tense2",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "w4-wed-tn21",
            "type": "fill",
            "question": "C919 ___ (make) its first flight in May 2023. [填入正确形式]",
            "answer": "made",
            "explanation_cn": "in May 2023 过去时间，make 的过去式是 made。"
          },
          {
            "id": "w4-wed-tn22",
            "type": "fill",
            "question": "Look! The big plane ___ (fly) higher and higher. [填入正确形式]",
            "answer": "is flying",
            "explanation_cn": "Look! 提示正在进行，用 is flying。"
          },
          {
            "id": "w4-wed-tn23",
            "type": "fill",
            "question": "More airlines ___ (choose) C919 since 2023. [填入正确形式]",
            "answer": "have chosen",
            "explanation_cn": "since 2023 与现在完成时连用。"
          },
          {
            "id": "w4-wed-tn24",
            "type": "fill",
            "question": "The plane ___ (carry) about 160 passengers. [填入正确形式]",
            "answer": "carries",
            "explanation_cn": "客观能力，主语三单用 carries。"
          },
          {
            "id": "w4-wed-tn25",
            "type": "fill",
            "question": "Chinese factories ___ (build) more C919s in the future. [填入正确形式]",
            "answer": "will build",
            "explanation_cn": "in the future 将来时间，用 will build。"
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
            "audio_text": "Photos of the red palace in white snow spread quickly online.",
            "options": [
              "Photos of the red palace in white snow spread quickly online.",
              "Photos of the red palace in white snow spread slowly online.",
              "Photos of the old park in white snow spread quickly online.",
              "Photos of the red palace in heavy rain spread quickly online."
            ],
            "answer": 0,
            "explanation_cn": "white snow（白雪）不是 rain；spread quickly（迅速传播）。"
          },
          {
            "id": "w4-thu-ls6",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "C919 can carry about 160 passengers.",
            "options": [
              "C919 can carry about 160 passengers.",
              "C919 can carry about 1060 passengers.",
              "C919 can carry about 60 passengers.",
              "C919 could carry about 160 passengers long ago."
            ],
            "answer": 0,
            "explanation_cn": "数字 160（一百六），别听成 1060。"
          },
          {
            "id": "w4-thu-ls7",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "Its first passenger flight was from Shanghai to Beijing.",
            "options": [
              "Its first passenger flight was from Shanghai to Beijing.",
              "Its first passenger flight was from Beijing to Shanghai.",
              "Its first test flight was from Shanghai to Beijing.",
              "Its last passenger flight was from Shanghai to Beijing."
            ],
            "answer": 0,
            "explanation_cn": "first（首次）flight，方向 Shanghai → Beijing。"
          },
          {
            "id": "w4-thu-ls8",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "Chang'e-5 brought moon soil back to the earth in 2020.",
            "options": [
              "Chang'e-5 brought moon soil back to the earth in 2020.",
              "Chang'e-6 brought moon soil back to the earth in 2020.",
              "Chang'e-5 brought moon rocks back to the moon in 2020.",
              "Chang'e-5 brought moon soil back to the earth in 2024."
            ],
            "answer": 0,
            "explanation_cn": "是 Chang'e-5（五号），2020年，带回了月壤。"
          },
          {
            "id": "w4-thu-ls9",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "Astronauts may build a research station on the moon.",
            "options": [
              "Astronauts may build a research station on the moon.",
              "Astronauts may build a research station on Mars.",
              "Astronauts may buy a research station on the moon.",
              "Scientists may build a research station under the sea."
            ],
            "answer": 0,
            "explanation_cn": "主语 astronauts，地点 the moon，建 research station（科研站）。"
          },
          {
            "id": "w4-thu-ls10",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "Paper cutting connects China and the world.",
            "options": [
              "Paper cutting connects China and the world.",
              "Paper cutting divides China and the world.",
              "Paper cutting connects the past and the world only.",
              "Paper cutting connects Beijing and Shanghai."
            ],
            "answer": 0,
            "explanation_cn": "connects（连接）不是 divides（分开）。"
          }
        ]
      },
      {
        "id": "w4-thu-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "The Hong Kong-Zhuhai-Macao Bridge is a wonder of modern engineering. It is the longest sea crossing bridge in the world, with a total 1___ of 55 kilometres. The bridge 2___ Hong Kong, Zhuhai and Macao like a dragon on the sea. Before the bridge, a trip between Hong Kong and Zhuhai 3___ about four hours by road. Now it takes only forty-five 4___. The bridge has to fight the sea wind and heavy storms, so engineers 5___ it for 120 years of use. It can also stand strong 6___. The tunnel in the middle runs 7___ the sea, so big ships can pass above it. The bridge 8___ in October 2018 after nine years of building. Workers used more than 400000 tons of steel, enough to 9___ sixty Eiffel Towers. Today, thousands of cars cross the bridge every day, and people say it 10___ the three cities into one big family.",
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
              "made",
              "make",
              "makes",
              "making"
            ],
            "answer": 0,
            "explanation_cn": "工程师把它「设计建造」为可使用120年，made it for…。"
          },
          {
            "id": "w4-thu-cz6",
            "type": "choice",
            "question": "6___",
            "options": [
              "earthquakes",
              "earthquake",
              "the earthquake of",
              "an earthquakes"
            ],
            "answer": 0,
            "explanation_cn": "stand strong earthquakes：抵御强震，复数泛指。"
          },
          {
            "id": "w4-thu-cz7",
            "type": "choice",
            "question": "7___",
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
            "id": "w4-thu-cz8",
            "type": "choice",
            "question": "8___",
            "options": [
              "opened",
              "opens",
              "opening",
              "open"
            ],
            "answer": 0,
            "explanation_cn": "in October 2018 过去时间，用过去式 opened。"
          },
          {
            "id": "w4-thu-cz9",
            "type": "choice",
            "question": "9___",
            "options": [
              "build",
              "builds",
              "building",
              "built"
            ],
            "answer": 0,
            "explanation_cn": "enough to build：足以建造六十座埃菲尔铁塔，to 后面用原形。"
          },
          {
            "id": "w4-thu-cz10",
            "type": "choice",
            "question": "10___",
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
          },
          {
            "id": "w4-thu-tn6",
            "type": "fill",
            "question": "Engineers ___ (design) the bridge to last 120 years. [填入正确形式]",
            "answer": "designed",
            "explanation_cn": "叙述设计事实，用过去式 designed。"
          },
          {
            "id": "w4-thu-tn7",
            "type": "fill",
            "question": "Big ships ___ (pass) over the tunnel every day. [填入正确形式]",
            "answer": "pass",
            "explanation_cn": "every day 习惯动作，主语复数用原形 pass。"
          },
          {
            "id": "w4-thu-tn8",
            "type": "fill",
            "question": "While the tunnel ___ (build), engineers met many problems. [填入正确形式]",
            "answer": "was being built",
            "explanation_cn": "隧道「被建造」的过程，过去进行时被动 was being built。"
          },
          {
            "id": "w4-thu-tn9",
            "type": "fill",
            "question": "By 2030, the bridge ___ (serve) for over twelve years. [填入正确形式]",
            "answer": "will have served",
            "explanation_cn": "by + 将来时间，用将来完成时 will have served。"
          },
          {
            "id": "w4-thu-tn10",
            "type": "fill",
            "question": "More bridges like this ___ (build) in the future. [填入正确形式]",
            "answer": "will be built",
            "explanation_cn": "将来会被建造，将来时被动 will be built。"
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
          },
          {
            "id": "w4-fri-gr13",
            "type": "fill",
            "question": "Please bring a ___ of water.（一瓶水）",
            "answer": "bottle",
            "explanation_cn": "一瓶水 a bottle of water。瓶装水也叫 bottled water。",
            "explanation_en": "A bottle of water."
          },
          {
            "id": "w4-fri-gr14",
            "type": "fill",
            "question": "Cut a ___ of ham first.（一片火腿）",
            "answer": "slice",
            "explanation_cn": "切下来的一片用 a slice of...：a slice of ham / bread / pizza。",
            "explanation_en": "A slice of ham."
          },
          {
            "id": "w4-fri-gr15",
            "type": "fill",
            "question": "Do you need two ___ of honey?（两罐蜂蜜）",
            "answer": "jars",
            "explanation_cn": "蜂蜜是罐装的：a jar of honey，两罐 two jars of honey。蜂蜜不可数，变复数的是 jar。",
            "explanation_en": "Honey is uncountable; the jar is countable: two jars of honey."
          },
          {
            "id": "w4-fri-gr16",
            "type": "fill",
            "question": "There are two ___ of paper on the desk.（两张纸）",
            "answer": "sheets",
            "explanation_cn": "纸不可数，一张纸 a sheet of paper，两张 two sheets of paper。",
            "explanation_en": "Paper is uncountable: two sheets of paper."
          },
          {
            "id": "w4-fri-gr17",
            "type": "fill",
            "question": "She used to drink two ___ of beer in the evening.（两罐啤酒）",
            "answer": "cans",
            "explanation_cn": "罐装啤酒 a can of beer，两罐 two cans of beer。啤酒本身不可数。",
            "explanation_en": "Beer is uncountable; two cans of beer."
          },
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
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周六",
    "day_en": "Saturday",
    "is_speaking_day": true,
    "total_duration": 55,
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
        "passage": "Paper cutting is one of China's oldest folk arts, and it is now becoming popular around the world. With only a pair of scissors and a piece of red paper, artists can make wonderful pictures of flowers, animals and people. In the north of China, people still put paper cuttings on windows during the Spring Festival, because the red colour means good luck. In 2009, Chinese paper cutting was added to the world intangible cultural heritage list. Today, paper cutting artists teach in schools and even online, and short videos of their hands moving quickly get millions of likes. Foreign visitors love taking paper cutting classes when they travel to China. A girl from France said, \"It looks easy, but one wrong cut and you must start again.\" Paper cutting connects the past and the present, the old and the young, China and the world.",
        "passage_cn": "剪纸是中国最古老的民间艺术之一，如今正在世界范围内流行。艺术家只用一把剪刀和一张红纸，就能剪出花草、动物和人像。在中国北方，春节时人们仍然把剪纸贴在窗上，因为红色代表好运。2009年，中国剪纸被列入世界非物质文化遗产名录。如今，剪纸艺人走进学校，甚至在网上教学，他们灵巧双手的短视频获得数百万点赞。外国游客来中国旅游时也喜欢上剪纸课。一位法国女孩说：「看起来容易，但只要剪错一刀，就得从头再来。」剪纸连接着过去与现在、老人与孩子、中国与世界。",
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
            "id": "w4-sat-rd3",
            "type": "choice",
            "question": "Why do people use red paper?",
            "options": [
              "Because red means good luck.",
              "Because red is cheap.",
              "Because red is bright.",
              "Because red is easy to cut."
            ],
            "answer": 0,
            "explanation_cn": "红色代表好运。"
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
            "id": "w4-sat-rd5",
            "type": "choice",
            "question": "What do paper cutting artists do today?",
            "options": [
              "They teach in schools and online.",
              "They only work at home.",
              "They sell scissors.",
              "They make paper."
            ],
            "answer": 0,
            "explanation_cn": "艺人进学校、上网课。"
          },
          {
            "id": "w4-sat-rd6",
            "type": "choice",
            "question": "What do the artists' short videos get?",
            "options": [
              "Millions of likes",
              "No likes",
              "Only a few likes",
              "Bad comments"
            ],
            "answer": 0,
            "explanation_cn": "短视频获得数百万点赞。"
          },
          {
            "id": "w4-sat-rd7",
            "type": "choice",
            "question": "Who loves taking paper cutting classes?",
            "options": [
              "Foreign visitors",
              "Only Chinese children",
              "Only old people",
              "Nobody"
            ],
            "answer": 0,
            "explanation_cn": "外国游客来中国喜欢上剪纸课。"
          },
          {
            "id": "w4-sat-rd8",
            "type": "choice",
            "question": "What did the French girl say?",
            "options": [
              "One wrong cut and you must start again.",
              "Paper cutting is too easy.",
              "She hates paper cutting.",
              "Paper cutting is expensive."
            ],
            "answer": 0,
            "explanation_cn": "「剪错一刀就得重来」。"
          },
          {
            "id": "w4-sat-rd9",
            "type": "choice",
            "question": "The word \"intangible\" here means ___.",
            "options": [
              "非物质的",
              "看不见的",
              "重要的",
              "古老的"
            ],
            "answer": 0,
            "explanation_cn": "intangible cultural heritage：非物质文化遗产。"
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
          },
          {
            "id": "w4-sat-mc5",
            "type": "choice",
            "question": "Paper cutting ___ to the world heritage list in 2009.",
            "options": [
              "was added",
              "added",
              "is added",
              "adds"
            ],
            "answer": 0,
            "explanation_cn": "剪纸「被列入」，过去时被动 was added。"
          }
        ]
      },
      {
        "id": "w4-sat-tense2",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "w4-sat-tn21",
            "type": "fill",
            "question": "Paper cutting ___ (be) popular for hundreds of years. [填入正确形式]",
            "answer": "has been",
            "explanation_cn": "for hundreds of years 与现在完成时连用。"
          },
          {
            "id": "w4-sat-tn22",
            "type": "fill",
            "question": "People ___ (add) it to the heritage list in 2009. [填入正确形式]",
            "answer": "added",
            "explanation_cn": "in 2009 过去时间，用过去式 added。"
          },
          {
            "id": "w4-sat-tn23",
            "type": "fill",
            "question": "Look! The artist ___ (cut) a red paper flower. [填入正确形式]",
            "answer": "is cutting",
            "explanation_cn": "Look! 提示正在进行，用 is cutting。"
          },
          {
            "id": "w4-sat-tn24",
            "type": "fill",
            "question": "Short videos of the artists ___ (get) millions of likes. [填入正确形式]",
            "answer": "have got",
            "explanation_cn": "表示已经获得的影响，用现在完成时。"
          },
          {
            "id": "w4-sat-tn25",
            "type": "fill",
            "question": "The girl ___ (start) again after the wrong cut. [填入正确形式]",
            "answer": "started",
            "explanation_cn": "叙述过去的事，用过去式 started。"
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周日",
    "day_en": "Sunday",
    "is_speaking_day": false,
    "total_duration": 30,
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
        "passage": "Chinese characters are one of the oldest writing systems in the world. People wrote on oracle bones more than 3000 years 1___. In old times, characters looked like the things they stood 2___. For example, the character for \"mountain\" looked like three 3___, and \"sun\" was a circle with a dot. Later, the characters became simpler and rounder. Today, Chinese people write with pens and 4___, but the old shapes are still easy to see. There are more than 50000 characters in all, 5___ people only use a few thousand in daily life. Schoolchildren learn about 2500 characters in six years. In 2010, the UN made Chinese Language Day to 6___ this old writing. Now more and more foreigners are learning Chinese, and some of them find characters 7___ but beautiful. A foreign student said each character is 8___ a small picture with a story inside. Calligraphy, the art of writing characters, is also 9___. With a brush and ink, a good writer can make the characters dance on the paper. Chinese characters carry the history of 5000 years, and they will keep 10___ for the next 5000 years.",
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
              "celebrate",
              "celebrates",
              "celebrating",
              "celebrated"
            ],
            "answer": 0,
            "explanation_cn": "to 后面用动词原形 celebrate（庆祝）。"
          },
          {
            "id": "w4-sun-cz7",
            "type": "choice",
            "question": "7___",
            "options": [
              "hard",
              "easy",
              "cheap",
              "soft"
            ],
            "answer": 0,
            "explanation_cn": "后面说但很美，说明学起来「难」，hard。"
          },
          {
            "id": "w4-sun-cz8",
            "type": "choice",
            "question": "8___",
            "options": [
              "like",
              "likes",
              "liking",
              "liked"
            ],
            "answer": 0,
            "explanation_cn": "is like a small picture：像一幅小画。"
          },
          {
            "id": "w4-sun-cz9",
            "type": "choice",
            "question": "9___",
            "options": [
              "famous",
              "fame",
              "famously",
              "more famous"
            ],
            "answer": 0,
            "explanation_cn": "is also famous：书法也很有名，形容词 famous。"
          },
          {
            "id": "w4-sun-cz10",
            "type": "choice",
            "question": "10___",
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
        "id": "w4-sun-tense",
        "name_cn": "时态练习",
        "type": "tense",
        "duration": 5,
        "questions": [
          {
            "id": "w4-sun-tn1",
            "type": "fill",
            "question": "People ___ (write) on oracle bones 3000 years ago. [填入正确形式]",
            "answer": "wrote",
            "explanation_cn": "3000 years ago 过去时间，write 的过去式是 wrote。"
          },
          {
            "id": "w4-sun-tn2",
            "type": "fill",
            "question": "Look! The old master ___ (write) with a brush. [填入正确形式]",
            "answer": "is writing",
            "explanation_cn": "Look! 提示正在进行，用 is writing。"
          },
          {
            "id": "w4-sun-tn3",
            "type": "fill",
            "question": "Chinese characters ___ (carry) history for 5000 years. [填入正确形式]",
            "answer": "have carried",
            "explanation_cn": "for 5000 years 与现在完成时连用。"
          },
          {
            "id": "w4-sun-tn4",
            "type": "fill",
            "question": "The UN ___ (make) Chinese Language Day in 2010. [填入正确形式]",
            "answer": "made",
            "explanation_cn": "in 2010 过去时间，make 的过去式是 made。"
          },
          {
            "id": "w4-sun-tn5",
            "type": "fill",
            "question": "More and more foreigners ___ (learn) Chinese now. [填入正确形式]",
            "answer": "are learning",
            "explanation_cn": "now 与进行时连用，主语复数 are learning。"
          }
        ]
      },
      {
        "id": "w4-sun-grammar",
        "name_cn": "语法练习",
        "type": "grammar",
        "duration": 5,
        "questions": [
          {
            "id": "w4-sun-gr1",
            "type": "choice",
            "question": "Chinese characters are one of the oldest ___ systems.",
            "options": [
              "writing",
              "write",
              "wrote",
              "written of"
            ],
            "answer": 0,
            "explanation_cn": "writing system 文字系统，动名词作定语。"
          },
          {
            "id": "w4-sun-gr2",
            "type": "choice",
            "question": "The character for \"mountain\" looked like three ___.",
            "options": [
              "peaks",
              "peak",
              "peak's",
              "a peak"
            ],
            "answer": 0,
            "explanation_cn": "three peaks 三个山峰，复数。"
          },
          {
            "id": "w4-sun-gr3",
            "type": "choice",
            "question": "Each character is ___ a small picture.",
            "options": [
              "like",
              "likes",
              "liking",
              "liked"
            ],
            "answer": 0,
            "explanation_cn": "be like：像，like 是介词。"
          },
          {
            "id": "w4-sun-gr4",
            "type": "choice",
            "question": "A good writer can make the characters ___ on the paper.",
            "options": [
              "dance",
              "dances",
              "dancing",
              "danced"
            ],
            "answer": 0,
            "explanation_cn": "make sth do sth：让字在纸上「跳舞」，用原形 dance。"
          },
          {
            "id": "w4-sun-gr5",
            "type": "choice",
            "question": "Chinese characters will keep ___ for the next 5000 years.",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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
            "question": "听到的句子是什么？",
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

const HOMEWORK_WEEKS = [WEEK1, WEEK2, WEEK3, WEEK4];

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
const HOMEWORK_WEEK_IDX = (function () {
  const days = Math.floor((new Date().setHours(12, 0, 0, 0) - HOMEWORK_EPOCH.getTime()) / 864e5);
  const w = Math.floor(days / 7);
  if (w < 0) return 0;
  if (w > HOMEWORK_WEEKS.length - 1) return HOMEWORK_WEEKS.length - 1;
  return w;
})();

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
let HOMEWORK_DATA = HOMEWORK_WEEKS[HOMEWORK_WEEK_IDX];

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
const CLOZE_SENTENCE_CN = {
  "thu-cloze": [
    "中国是茶的故乡。",
    "中国人很久很久以前就开始喝茶了。",
    "在过去，人们沿着古老的道路把茶叶运往许多国家。",
    "那条路在今天被叫做「茶马古道」。",
    "中国有很多种茶，比如绿茶和红茶。",
    "绿茶生长在杭州和其他温暖的地方。",
    "大多数中国人喜欢喝热茶，不喝冷茶。",
    "客人来家里时，主人总会端上一杯茶。",
    "这是一种表达欢迎和喜爱的方式。",
    "人们还说喝茶对健康有好处。",
    "下次你去中国人家里做客，记得好好品一品那杯茶。",
    "它带着悠久的历史和温暖的心意。"
  ],
  "sun-cloze": [
    "京剧是中国最古老的民间艺术之一。",
    "它有两百多年的历史。",
    "演员们穿着漂亮的戏服，把脸画成不同的颜色。",
    "红脸代表善良勇敢的人，白脸代表坏人。",
    "演员们用特别的方式演唱，用特别的动作表演。",
    "许多老人喜欢在电视上或戏院里看京剧。",
    "一些孩子在学校社团里学京剧。",
    "学京剧并不容易，因为演员可能要练习很多年才能唱好。",
    "如今，越来越多的年轻人开始喜爱这门古老的艺术。",
    "它是中国文化重要的一部分。",
    "只要你看过一次，就永远不会忘记它。"
  ],
  "w2-thu-cloze": [
    "新能源汽车在中国越来越受欢迎。",
    "它们用电不用汽油。",
    "它们产生的污染更少，所以大城市的空气变得更好。",
    "这些车还很安静。",
    "当你坐在新能源汽车里，几乎听不到发动机的声音。",
    "司机可以在充电站给车充电，就像给一部大手机充电一样。",
    "把电池充满大约要一个小时。",
    "这些车并不贵，政府还会补贴购车的人。",
    "在大城市，许多家庭选择把新能源汽车作为家里的第二辆车。",
    "越来越多的充电站正在路边出现。",
    "将来，街上行驶的大多数汽车都会是电动车。"
  ],
  "w2-sun-cloze": [
    "无人机是会飞的小机器，它们正在改变我们的生活。",
    "一家快递公司现在用无人机送包裹。",
    "无人机从空中带着包裹，几分钟就送到你家门口。",
    "山村里的医生也用无人机快速拿到药品。",
    "在无人机出现之前，药品要两天才能到；现在只需要三十分钟。",
    "消防员用无人机看火情在哪里。",
    "农民用它们从空中看庄稼。",
    "无人机并不贵，越来越多的人可以买一台。",
    "但是有规则：无人机不能在机场附近飞，孩子需要大人帮忙。",
    "科学家正在研制能载人的更大的无人机。",
    "也许有一天，我们会坐无人机出租车去上学！"
  ],
  "w3-thu-cloze": [
    "垃圾分类如今是中国城市里的重要习惯。",
    "在上海和其他很多城市，人们必须把垃圾分成四类：干垃圾、湿垃圾、可回收物和有害垃圾。",
    "香蕉皮这样的厨余是湿垃圾。",
    "瓶子、纸张和旧衣服是可回收物，因为它们能变成新的东西。",
    "电池和过期药品是有害垃圾，所以我们要特别小心地处理它们。",
    "一开始很多人觉得很难记住这四类，但现在大多数人都能分好。",
    "一些小区给分得好的居民小奖励，比如肥皂和鸡蛋。",
    "孩子们在学校学习垃圾分类，回家再教爸爸妈妈。",
    "每天给垃圾分类只花一分钟，却对地球帮助很大。",
    "如果人人都参与，我们的城市会变得干净得多、美丽得多。"
  ],
  "w3-sun-cloze": [
    "在中国，越来越多的人热爱跑步，城市马拉松比赛现在到处都有。",
    "每年，北京、上海等大城市都会举办马拉松比赛。",
    "数以万计的人参加。",
    "跑者们穿着运动服，背上有号码布。",
    "全程大约四十二公里，通常一大早开始。",
    "很多人跑得不快，但他们坚持跑到终点。",
    "医生和志愿者沿路守候，随时提供帮助。",
    "每隔几公里的补给站提供免费的水和水果。",
    "跑步对心脏有好处，还让人心情愉快。",
    "孩子们可以参加大约三公里的短程赛。",
    "想跑好，比赛前必须坚持每天练习几个月。",
    "马拉松不只是一场比赛，它是一堂「永不放弃」的课。"
  ],
  "w4-thu-cloze": [
    "港珠澳大桥是现代工程的奇迹。",
    "它是世界上最长的跨海大桥，全长55公里。",
    "大桥像一条海上巨龙，把香港、珠海和澳门连接起来。",
    "在大桥建成之前，香港到珠海坐车要四个小时。",
    "现在只需要四十五分钟。",
    "大桥要对抗海风和强台风，所以工程师把它设计为可以使用120年。",
    "它还能抵御强烈地震。",
    "中段的海底隧道在海面之下穿行，大型船只可以从上方通过。",
    "大桥经过九年建设，于2018年10月通车。",
    "工人用了超过40万吨钢铁，足够建造六十座埃菲尔铁塔。",
    "如今每天有成千上万的汽车通过大桥，人们说它把三座城市连成了一个大家庭。"
  ],
  "w4-sun-cloze": [
    "汉字是世界上最古老的文字系统之一。",
    "三千多年前，人们把字刻在甲骨上。",
    "古时候，汉字长得像它们所代表的东西。",
    "比如，「山」字像三个山峰，「日」字是一个圆圈加一点。",
    "后来，汉字变得更简单、更圆润。",
    "今天，中国人用笔和键盘写字，但古老的字形仍然看得出来。",
    "汉字总共有五万多个，但日常生活中人们只用几千个。",
    "小学生六年里学大约2500个字。",
    "2010年，联合国设立了中文日来纪念这种古老的文字。",
    "现在越来越多的外国人学中文，有些人觉得汉字难，但很美。",
    "一位外国学生说，每个汉字都像一幅藏着故事的小画。",
    "书法，这门写字的艺术，也很有名。",
    "一支毛笔、一滴墨，好的书写者能让字在纸上跳舞。",
    "汉字承载着五千年的历史，还会在未来五千年继续生长。"
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
