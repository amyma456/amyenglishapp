const WEEK1 = [
  {
    "day_cn": "周一",
    "day_en": "Monday",
    "is_speaking_day": true,
    "total_duration": 40,
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
            "explanation_en": "This is a daily conversation question asking about your favorite subject. You should directly state the subject using 'My favorite subject is...'. Note the pronunciation of 'subject' with stress on the first syllable /ˈsʌbdʒekt/."
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
            "explanation_en": "This question asks about transportation. Common answers: by bus/car/bike/subway or on foot. Note that we use 'by' without 'a' before the transport. The 'sch' in 'school' is pronounced /sk/, not /ʃ/."
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
            "explanation_en": "This question uses the simple past tense to ask about last weekend. Since the question uses 'did', the answer must use past tense verbs (went, played, visited). The tense must be consistent."
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
            "explanation_en": "This is an open-ended question about family. Your answer should include the number of family members and who they are. Common pattern: 'There are... people in my family.' Note: when listing family members, put yourself last using 'me' not 'I'."
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
            "explanation_en": "This question asks about future career aspirations. Answer format: I want to be a/an + job + because + reason. Note: use 'an' before vowels (e.g., an engineer). 'Grow up' is a fixed phrase meaning to become an adult."
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
            ]
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
            ]
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
            ]
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
            ]
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
            ]
          }
        ]
      },
      {
        "id": "mon-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 5,
        "passage": "Tom is a 10-year-old boy from England. He loves sports, especially football. Every Saturday, he plays football with his friends in the park. His dream is to become a professional football player one day. His father is a PE teacher and always helps him practice. Tom also likes reading books about famous football players.",
        "passage_cn": "汤姆是一个来自英国的10岁男孩。他热爱运动，尤其是足球。每个星期六，他和朋友们在公园里踢足球。他的梦想是有一天成为一名职业足球运动员。他的父亲是一名体育老师，总是帮助他练习。汤姆也喜欢阅读关于著名足球运动员的书籍。",
        "questions": [
          {
            "id": "mon-rd1",
            "type": "choice",
            "question": "How old is Tom?",
            "options": [
              "8 years old",
              "10 years old",
              "12 years old",
              "14 years old"
            ],
            "answer": 1,
            "explanation_cn": "文章第一句明确说 Tom is a 10-year-old boy，所以汤姆10岁。注意 10-year-old 作形容词时，year 不加 s，中间用连字符连接。",
            "explanation_en": "The first sentence states 'Tom is a 10-year-old boy', so Tom is 10 years old. Note: when used as an adjective before a noun, 'year' doesn't take 's' and hyphens are used: 10-year-old boy."
          },
          {
            "id": "mon-rd2",
            "type": "choice",
            "question": "What does Tom do every Saturday?",
            "options": [
              "Reads books",
              "Plays football",
              "Watches TV",
              "Goes swimming"
            ],
            "answer": 1,
            "explanation_cn": "文章说 Every Saturday, he plays football with his friends in the park。每个星期六他和朋友在公园踢足球。注意 every Saturday 表示每周六，用一般现在时。",
            "explanation_en": "The text says 'Every Saturday, he plays football with his friends in the park.' Note: 'every Saturday' indicates a regular habit, so the simple present tense is used."
          },
          {
            "id": "mon-rd3",
            "type": "choice",
            "question": "What is Tom's dream?",
            "options": [
              "To be a teacher",
              "To be a football player",
              "To be a writer",
              "To be a doctor"
            ],
            "answer": 1,
            "explanation_cn": "文章说 His dream is to become a professional football player one day。他的梦想是有一天成为职业足球运动员。注意 professional 意为职业的，one day 意为有一天（指未来）。",
            "explanation_en": "The text says 'His dream is to become a professional football player one day.' Note: 'professional' means doing something as a paid job, and 'one day' refers to a future time."
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
        "passage": "Emma lives in a small town near the sea. Every morning, she walks to school with her best friend Lily. They have known each other since kindergarten. Emma's favorite class is Art because she loves drawing pictures of the ocean. After school, she often goes to the beach to collect seashells. She has a big collection of beautiful shells in her room.",
        "passage_cn": "艾玛住在海边的一个小镇上。每天早上，她和最好的朋友莉莉一起走路上学。她们从幼儿园就认识了。艾玛最喜欢的课是美术，因为她喜欢画大海的画。放学后，她经常去海滩收集贝壳。她的房间里有一大堆美丽的贝壳收藏。",
        "questions": [
          {
            "id": "tue-rd1",
            "type": "choice",
            "question": "Where does Emma live?",
            "options": [
              "In a big city",
              "Near the sea",
              "In the mountains",
              "Near a forest"
            ],
            "answer": 1,
            "explanation_cn": "文章第一句说 Emma lives in a small town near the sea。艾玛住在海边的一个小镇上。near the sea 意为靠近海边，注意区分 near（靠近）和 next to（紧挨着）的用法。",
            "explanation_en": "The first sentence says 'Emma lives in a small town near the sea.' 'Near the sea' means close to the sea. Note the difference between 'near' (close to) and 'next to' (immediately beside)."
          },
          {
            "id": "tue-rd2",
            "type": "choice",
            "question": "Who is Lily?",
            "options": [
              "Emma's sister",
              "Emma's teacher",
              "Emma's best friend",
              "Emma's neighbor"
            ],
            "answer": 2,
            "explanation_cn": "文章说 she walks to school with her best friend Lily。莉莉是艾玛最好的朋友。best friend 意为最好的朋友，注意 friend 是可数名词，前面有形容词修饰时可以加冠词或代词。",
            "explanation_en": "The text says 'she walks to school with her best friend Lily.' Lily is Emma's best friend. 'Best friend' means the closest friend. Note: 'friend' is a countable noun."
          },
          {
            "id": "tue-rd3",
            "type": "choice",
            "question": "Why does Emma like Art class?",
            "options": [
              "Because she likes the teacher",
              "Because she loves drawing",
              "Because it's easy",
              "Because her friend is there"
            ],
            "answer": 1,
            "explanation_cn": "文章说 Emma's favorite class is Art because she loves drawing pictures of the ocean。艾玛最喜欢美术课因为她喜欢画大海。because 引导原因状语从句，解释为什么喜欢美术课。",
            "explanation_en": "The text says 'Emma's favorite class is Art because she loves drawing pictures of the ocean.' The 'because' clause explains the reason. 'Drawing pictures of the ocean' means making pictures about the sea."
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
            "question": "She ___ to school every day.",
            "options": [
              "go",
              "goes",
              "going",
              "went"
            ],
            "answer": 1,
            "explanation_cn": "主语 She 是第三人称单数，every day 表示经常性动作，用一般现在时。第三人称单数动词加 -es：go → goes。注意 do → does, watch → watches, study → studies 等变化规则。",
            "explanation_en": "The subject 'She' is third person singular, and 'every day' indicates a habitual action, so we use the simple present tense. Third person singular verbs add -s or -es: go → goes. Note other patterns: do → does, watch → watches, study → studies."
          },
          {
            "id": "tue-gr2",
            "type": "choice",
            "question": "I ___ my homework when he called me.",
            "options": [
              "do",
              "did",
              "was doing",
              "am doing"
            ],
            "answer": 2,
            "explanation_cn": "这句话表示当过去某个动作发生时，另一个动作正在进行。called 是过去时，所以正在进行的动作用过去进行时 was doing。注意过去进行时结构：was/were + doing。",
            "explanation_en": "This sentence describes an action in progress when another past action occurred. 'Called' is past tense, so the ongoing action uses the past continuous: was doing. Structure: was/were + verb-ing."
          },
          {
            "id": "tue-gr3",
            "type": "fill",
            "question": "There ___ (be) many books on the shelf. [填入正确形式]",
            "answer": "are",
            "explanation_cn": "There be 句型遵循就近原则。books 是复数，且在 shelf 上，离动词最近的是 many books，所以用 are。注意 There is a book and two pens 中，离动词最近的是 a book（单数），用 is。",
            "explanation_en": "The 'There be' pattern follows the principle of proximity - the verb agrees with the nearest noun. Since 'books' is plural and nearest to the verb, we use 'are'. Note: 'There is a book and two pens' uses 'is' because 'a book' (singular) is nearest."
          },
          {
            "id": "tue-gr4",
            "type": "choice",
            "question": "He has ___ eaten his breakfast.",
            "options": [
              "yet",
              "already",
              "never",
              "just now"
            ],
            "answer": 1,
            "explanation_cn": "现在完成时 has eaten 中，already 用于肯定句表示已经。yet 用于否定句和疑问句。never 表示从不。just now 一般与过去时连用。注意 already 常放在 have/has 和过去分词之间。",
            "explanation_en": "In the present perfect 'has eaten', 'already' is used in affirmative sentences meaning something has happened. 'Yet' is for negatives and questions. 'Never' means not at any time. 'Just now' is usually used with past tense. 'Already' goes between have/has and the past participle."
          },
          {
            "id": "tue-gr5",
            "type": "fill",
            "question": "The boy ___ (talk) to his teacher now is my brother. [填入正确形式]",
            "answer": "talking",
            "explanation_cn": "这句话中 The boy is my brother 是主句，talking to his teacher now 是现在分词短语作后置定语修饰 The boy。boy 和 talk 是主动关系，所以用现在分词 talking。相当于 who is talking 的省略。",
            "explanation_en": "In this sentence, 'The boy is my brother' is the main clause. 'Talking to his teacher now' is a present participle phrase used as a post-modifier describing 'The boy'. Since the boy and talk have an active relationship, we use the present participle 'talking'. It's a shortened form of 'who is talking'."
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
            "question": "___ interesting book it is!",
            "options": [
              "What",
              "What an",
              "How",
              "How an"
            ],
            "answer": 1,
            "explanation_cn": "感叹句结构：What (a/an) + 形容词 + 名词 + 主语 + 谓语！book 是可数名词单数，interesting 元音音素开头用 an。所以是 What an interesting book it is! 注意 How 引导的感叹句结构：How + 形容词/副词 + 主语 + 谓语！",
            "explanation_en": "Exclamatory sentence structure: What (a/an) + adjective + noun + subject + verb! 'Book' is a singular countable noun, and 'interesting' starts with a vowel sound, so we use 'an'. Answer: What an interesting book it is! Note: 'How' structure is: How + adj/adv + subject + verb!"
          },
          {
            "id": "tue-mc2",
            "type": "choice",
            "question": "My father will come back ___ next week.",
            "options": [
              "sometime",
              "some time",
              "sometimes",
              "some times"
            ],
            "answer": 0,
            "explanation_cn": "这四个词容易混淆：sometime 某个时候（未来或过去）；some time 一段时间；sometimes 有时（频度副词）；some times 几次。句意是下周某个时候回来，选 sometime。",
            "explanation_en": "These four are easily confused: 'sometime' = at some unspecified time; 'some time' = a period of time; 'sometimes' = occasionally (adverb of frequency); 'some times' = several occasions. The sentence means 'at some time next week', so 'sometime' is correct."
          },
          {
            "id": "tue-mc3",
            "type": "choice",
            "question": "The teacher asked us ___ noise in class.",
            "options": [
              "don't make",
              "not make",
              "to not make",
              "not to make"
            ],
            "answer": 3,
            "explanation_cn": "ask sb to do sth 是固定结构，否定形式是 ask sb not to do sth。注意 not 要放在 to do 前面，不是 to not do。类似的还有 tell sb not to do, want sb not to do 等。",
            "explanation_en": "'Ask sb to do sth' is a fixed pattern, and its negative form is 'ask sb not to do sth'. Note: 'not' comes before 'to do', not 'to not do'. Similar patterns: tell sb not to do, want sb not to do."
          },
          {
            "id": "tue-mc4",
            "type": "choice",
            "question": "___ of the students in our class ___ girls.",
            "options": [
              "Two-third; are",
              "Two-thirds; are",
              "Two-thirds; is",
              "Two-third; is"
            ],
            "answer": 1,
            "explanation_cn": "分数表达：分子用基数词，分母用序数词，分子大于1时分母加 s。2/3 = two-thirds。主语 students 是复数，谓语用 are。注意 population 做主语时用单数，但分数+population 时谓语取决于上下文。",
            "explanation_en": "Fraction expression: numerator uses cardinal number, denominator uses ordinal number, and when the numerator is greater than 1, the denominator takes 's'. 2/3 = two-thirds. The subject 'students' is plural, so the verb is 'are'."
          },
          {
            "id": "tue-mc5",
            "type": "choice",
            "question": "I don't know ___ tomorrow.",
            "options": [
              "if will it rain",
              "if it will rain",
              "whether it rains",
              "whether does it rain"
            ],
            "answer": 1,
            "explanation_cn": "宾语从句用陈述语序（主语+谓语），排除 A 和 D。tomorrow 表示将来时，用 will rain。if 和 whether 都可以引导宾语从句表示是否，但 if 更口语化。注意从句时态：主句现在时，从句可以用将来时。",
            "explanation_en": "Object clauses use statement word order (subject + verb), eliminating A and D. 'Tomorrow' indicates future tense, so 'will rain' is used. Both 'if' and 'whether' can introduce object clauses meaning 'whether', but 'if' is more colloquial."
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周三",
    "day_en": "Wednesday",
    "is_speaking_day": true,
    "total_duration": 40,
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
            "explanation_en": "This question asks about daily routine time. Answer: I usually + verb + at + time. 'Usually' is an adverb of frequency placed before the main verb. Time expression: 6:30 can be read as 'six thirty' or 'half past six'."
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
            "explanation_en": "'What's the weather like?' is a common pattern for asking about weather. Answer: It's + weather adjective. Common weather words: sunny, cloudy, rainy, windy, snowy, foggy. Note: 'weather' is an uncountable noun."
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
            "explanation_en": "This question uses 'be going to' to ask about summer vacation plans. Structure: be going to + base verb means 'plan to do something'. Note: no preposition before 'this summer vacation'. The answer should match with 'be going to' structure."
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
            "explanation_en": "This is a person description question. Your answer should include physical appearance (tall, short, thin, etc.) and personality traits (kind, funny, smart, etc.). Common patterns: She/He is + adjective. She/He has + feature. 'Describe' is a verb; its noun form is 'description'."
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
            "explanation_en": "This question asks about favorite food and the reason. Answer format: My favorite food is + food + because + reason. Common reason words: delicious, healthy, sweet. Note: 'food' is uncountable, but specific food names like 'dumplings' are countable."
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
            ]
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
            ]
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
            ]
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
            ]
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
            ]
          }
        ]
      },
      {
        "id": "wed-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 5,
        "passage": "David is a 12-year-old boy who loves science. His dream is to become an astronaut and travel to space. Every week, he reads books about planets and stars. His science teacher, Mr. Brown, encourages him to study hard. Last summer, David visited a space museum with his class. He saw real rockets and spacesuits there. It was the most exciting day of his life.",
        "passage_cn": "大卫是一个12岁的男孩，热爱科学。他的梦想是成为一名宇航员去太空旅行。每周他都读关于行星和恒星的书。他的科学老师布朗先生鼓励他努力学习。去年夏天，大卫和全班同学参观了太空博物馆。他在那里看到了真正的火箭和宇航服。那是他一生中最激动人心的一天。",
        "questions": [
          {
            "id": "wed-rd1",
            "type": "choice",
            "question": "What does David want to be?",
            "options": [
              "A teacher",
              "An astronaut",
              "A doctor",
              "A football player"
            ],
            "answer": 1,
            "explanation_cn": "文章说 His dream is to become an astronaut and travel to space。大卫的梦想是成为宇航员。astronaut 意为宇航员，注意该词的拼写和发音 /ˈæstrənɔːt/。",
            "explanation_en": "The text says 'His dream is to become an astronaut and travel to space.' 'Astronaut' means a person who travels in space. Note the pronunciation /ˈæstrənɔːt/."
          },
          {
            "id": "wed-rd2",
            "type": "choice",
            "question": "What did David see at the space museum?",
            "options": [
              "Books and pencils",
              "Rockets and spacesuits",
              "Animals and plants",
              "Movies and games"
            ],
            "answer": 1,
            "explanation_cn": "文章说 He saw real rockets and spacesuits there。他在太空博物馆看到了真正的火箭和宇航服。real 意为真正的，rockets 意为火箭，spacesuits 意为宇航服。",
            "explanation_en": "The text says 'He saw real rockets and spacesuits there.' 'Real' means actual, not fake. 'Rockets' are space vehicles, and 'spacesuits' are special suits for astronauts."
          },
          {
            "id": "wed-rd3",
            "type": "choice",
            "question": "How did David feel about the museum visit?",
            "options": [
              "Bored",
              "Excited",
              "Scared",
              "Tired"
            ],
            "answer": 1,
            "explanation_cn": "文章最后一句说 It was the most exciting day of his life。这是他一生中最激动人心的一天。exciting 意为令人激动的，注意 exciting（令人激动的）和 excited（感到激动的）的区别。",
            "explanation_en": "The last sentence says 'It was the most exciting day of his life.' 'Exciting' means causing excitement. Note the difference: 'exciting' describes something that causes excitement, while 'excited' describes how someone feels."
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
            "audio_text": "I usually have breakfast at seven o'clock.",
            "options": [
              "I usually have breakfast at seven o'clock.",
              "I usually have lunch at seven o'clock.",
              "I usually have dinner at seven o'clock.",
              "I usually have breakfast at six o'clock."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：breakfast（早餐）和 seven o'clock（七点）。注意区分 breakfast/lunch/dinner 的发音。breakfast /ˈbrekfəst/，lunch /lʌntʃ/，dinner /ˈdɪnə/。听的时候要抓住关键信息。",
            "explanation_en": "Key listening words: 'breakfast' and 'seven o\\'clock'. Note the difference in pronunciation: breakfast /ˈbrekfəst/, lunch /lʌntʃ/, dinner /ˈdɪnə/. Focus on key information when listening."
          },
          {
            "id": "thu-ls2",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "She is wearing a red dress today.",
            "options": [
              "She is wearing a red dress today.",
              "She is wearing a red skirt today.",
              "She is wearing a blue dress today.",
              "She is wearing a red hat today."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：wearing（穿着），red（红色），dress（裙子）。注意 dress 和 skirt 的区别：dress 是连衣裙，skirt 是半身裙。wearing 的发音 /ˈweərɪŋ/，注意 ing 的鼻音。",
            "explanation_en": "Key words: 'wearing', 'red', 'dress'. Note the difference: 'dress' is a one-piece garment, 'skirt' is a separate bottom. 'Wearing' is pronounced /ˈweərɪŋ/ with a nasal ending."
          },
          {
            "id": "thu-ls3",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "The library is next to the post office.",
            "options": [
              "The library is next to the post office.",
              "The library is behind the post office.",
              "The bank is next to the post office.",
              "The library is next to the school."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：library（图书馆），next to（紧挨着），post office（邮局）。注意 next to 和 behind 的区别：next to 是旁边，behind 是后面。library 的发音注意 /ˈlaɪbrəri/。",
            "explanation_en": "Key words: 'library', 'next to', 'post office'. Note: 'next to' means beside, 'behind' means at the back. Library pronunciation: /ˈlaɪbrəri/."
          },
          {
            "id": "thu-ls4",
            "type": "fill",
            "question": "听到的数字是什么？",
            "audio_text": "There are forty-eight students in our class.",
            "answer": "48",
            "explanation_cn": "听力数字：forty-eight (48)。注意英语数字的构成：40 是 forty（不是 fourty），8 是 eight。连读时 forty-eight 中 y 和 e 之间有轻微过渡音。注意区分 fourteen (14) 和 forty (40) 的发音。",
            "explanation_en": "Number: forty-eight (48). Note: 40 is spelled 'forty' (not 'fourty'), 8 is 'eight'. Distinguish between 'fourteen' (14) /ˌfɔːˈtiːn/ and 'forty' (40) /ˈfɔːti/ by stress and vowel length."
          },
          {
            "id": "thu-ls5",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "Would you like something to drink?",
            "options": [
              "Would you like something to drink?",
              "Would you like something to eat?",
              "Do you want something to drink?",
              "Could you give me something to drink?"
            ],
            "answer": 0,
            "explanation_cn": "听力关键句型：Would you like something to drink? 这是一句礼貌的询问。Would you like 比 Do you want 更客气。something to drink 意为喝的东西。注意 something 的发音 /ˈsʌmθɪŋ/，th 发 /θ/。",
            "explanation_en": "Key pattern: 'Would you like something to drink?' This is a polite offer. 'Would you like' is more polite than 'Do you want'. 'Something to drink' means a beverage. 'Something' is pronounced /ˈsʌmθɪŋ/ with /θ/."
          }
        ]
      },
      {
        "id": "thu-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "Last Sunday, Lisa went to the zoo with her family. She saw many 1___ there. First, they visited the monkeys. The monkeys were 2___ from tree to tree. Then they went to see the 3___. The elephants were very big and strong. Lisa's favorite animal is the 4___ because it has a long neck. At noon, they had a picnic 5___ a big tree. It was a wonderful day.",
        "questions": [
          {
            "id": "thu-cz1",
            "type": "choice",
            "question": "1___",
            "options": [
              "animals",
              "books",
              "friends",
              "teachers"
            ],
            "answer": 0,
            "explanation_cn": "上下文是去动物园（zoo），所以看到的是动物（animals）。注意 zoo 意为动物园，animal 意为动物。many 后面接可数名词复数，所以用 animals。",
            "explanation_en": "The context is visiting a zoo, so they saw 'animals'. 'Zoo' means a place where animals are kept. 'Many' is followed by plural countable nouns, so 'animals'."
          },
          {
            "id": "thu-cz2",
            "type": "choice",
            "question": "2___",
            "options": [
              "jumping",
              "reading",
              "sleeping",
              "writing"
            ],
            "answer": 0,
            "explanation_cn": "猴子在树间跳跃，用 jumping。from tree to tree 意为从一棵树到另一棵树。jump 意为跳跃，jumping 是现在分词表示正在进行的动作。注意猴子（monkey）的天性是跳跃。",
            "explanation_en": "Monkeys jump from tree to tree, so 'jumping' is correct. 'From tree to tree' means between trees. 'Jumping' is the present participle showing ongoing action. Monkeys are naturally active and jump around."
          },
          {
            "id": "thu-cz3",
            "type": "choice",
            "question": "3___",
            "options": [
              "elephants",
              "pencils",
              "computers",
              "desks"
            ],
            "answer": 0,
            "explanation_cn": "后一句说 The elephants were very big and strong，所以这里填 elephants。elephant 意为大象，注意拼写 e-l-e-p-h-a-n-t。big and strong 意为大而强壮。",
            "explanation_en": "The next sentence says 'The elephants were very big and strong', so the answer is 'elephants'. Note the spelling: e-l-e-p-h-a-n-t. 'Big and strong' means large in size and powerful."
          },
          {
            "id": "thu-cz4",
            "type": "choice",
            "question": "4___",
            "options": [
              "giraffe",
              "tiger",
              "fish",
              "bird"
            ],
            "answer": 0,
            "explanation_cn": "有长脖子（long neck）的动物是长颈鹿（giraffe）。giraffe 意为长颈鹿，注意拼写和发音 /dʒəˈrɑːf/。a long neck 意为长脖子。",
            "explanation_en": "The animal with a long neck is the 'giraffe'. Note the spelling and pronunciation /dʒəˈrɑːf/. 'A long neck' means a lengthy neck, which is the giraffe's most distinctive feature."
          },
          {
            "id": "thu-cz5",
            "type": "choice",
            "question": "5___",
            "options": [
              "under",
              "on",
              "in",
              "above"
            ],
            "answer": 0,
            "explanation_cn": "在大树下野餐用 under a big tree。under 意为在...下面。注意区分：on 在...上面，in 在...里面，above 在...上方（不接触），under 在...正下方。picnic 意为野餐。",
            "explanation_en": "Having a picnic under a tree uses 'under'. 'Under' means directly below something. Note: 'on' = on top of, 'in' = inside, 'above' = higher than (not touching), 'under' = directly below. 'Picnic' means an outdoor meal."
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
            "question": "I ___ (visit) my grandmother last Sunday. [填入正确形式]",
            "answer": "visited",
            "explanation_cn": "last Sunday 是过去时间标志词，用一般过去时。visit 的过去式是 visited（直接加 ed）。注意规则动词过去式变化：一般加 ed，以 e 结尾加 d，辅音+y 变 y 为 i 加 ed，重读闭音节双写末尾辅音加 ed。",
            "explanation_en": "'Last Sunday' is a past time marker, so we use the simple past tense. The past form of 'visit' is 'visited' (add -ed). Regular verb past tense rules: add -ed; if ending in 'e', add -d; consonant+y changes to -ied; double the final consonant for stressed closed syllables."
          },
          {
            "id": "thu-tn2",
            "type": "fill",
            "question": "Look! The children ___ (play) football on the playground. [填入正确形式]",
            "answer": "are playing",
            "explanation_cn": "Look! 是现在进行时标志词，表示正在发生的动作。结构：be + doing。children 是复数，用 are playing。注意 Look! / Listen! / now / at the moment 等都是现在进行时标志词。",
            "explanation_en": "'Look!' is a present continuous tense marker, indicating an action happening now. Structure: be + verb-ing. 'Children' is plural, so 'are playing'. Markers: Look!, Listen!, now, at the moment all indicate present continuous."
          },
          {
            "id": "thu-tn3",
            "type": "fill",
            "question": "My father ___ (work) in this factory since 2010. [填入正确形式]",
            "answer": "has worked",
            "explanation_cn": "since 2010 是现在完成时标志词，表示从过去持续到现在。结构：have/has + 过去分词。主语 My father 是第三人称单数，用 has worked。注意 since + 时间点，for + 时间段。",
            "explanation_en": "'Since 2010' is a present perfect tense marker, indicating an action from the past continuing to now. Structure: have/has + past participle. 'My father' is third person singular, so 'has worked'. Note: 'since' + point in time, 'for' + period of time."
          },
          {
            "id": "thu-tn4",
            "type": "fill",
            "question": "We ___ (have) an English test tomorrow. [填入正确形式]",
            "answer": "will have",
            "explanation_cn": "tomorrow 是将来时间标志词，用一般将来时 will + 动词原形。也可以用 be going to have。注意 will 后面接动词原形，不要写成 will to have。will 可以缩写为 'll。",
            "explanation_en": "'Tomorrow' is a future time marker, using the simple future tense: will + base verb. 'Be going to have' is also acceptable. Note: 'will' is followed by the base form of the verb, not 'to + verb'. 'Will' can be contracted to ''ll'."
          },
          {
            "id": "thu-tn5",
            "type": "choice",
            "question": "By the time he arrived, the train ___.",
            "options": [
              "left",
              "has left",
              "had left",
              "was leaving"
            ],
            "answer": 2,
            "explanation_cn": "By the time + 过去时，主句用过去完成时 had + 过去分词。表示在过去的某个时间点之前已经完成的动作。arrived 是过去时，火车离开发生在到达之前，所以用 had left。过去完成时表示过去的过去。",
            "explanation_en": "With 'By the time' + past tense, the main clause uses the past perfect: had + past participle. It shows an action completed before a past time. 'Arrived' is past tense; the train leaving happened before arriving, so 'had left'. Past perfect = the past of the past."
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周五",
    "day_en": "Friday",
    "is_speaking_day": false,
    "total_duration": 30,
    "theme_cn": "模板写作 + KET/PET题型 + 语法复习",
    "modules": [
      {
        "id": "fri-writing",
        "name_cn": "写作练习",
        "type": "writing_template",
        "duration": 15,
        "title": "My Best Friend",
        "requirement_cn": "请根据关键词提示完成作文，完成后请背诵全文。明天将进行挖空默写测试！",
        "keywords": [
          "best friend",
          "tall and kind",
          "play together",
          "help each other",
          "happy"
        ],
        "keywords_cn": [
          "最好的朋友",
          "又高又善良",
          "一起玩",
          "互相帮助",
          "开心的"
        ],
        "template": "My {{1}} is Tom. He is very {{2}}. We often {{3}} after school. We always {{4}} with our homework. I feel very {{5}} when I am with him.",
        "blanks": [
          {
            "id": 1,
            "hint_cn": "最好的朋友",
            "hint_en": "best friend",
            "answer": "best friend"
          },
          {
            "id": 2,
            "hint_cn": "又高又善良",
            "hint_en": "tall and kind",
            "answer": "tall and kind"
          },
          {
            "id": 3,
            "hint_cn": "一起玩",
            "hint_en": "play together",
            "answer": "play together"
          },
          {
            "id": 4,
            "hint_cn": "互相帮助",
            "hint_en": "help each other",
            "answer": "help each other"
          },
          {
            "id": 5,
            "hint_cn": "开心的",
            "hint_en": "happy",
            "answer": "happy"
          }
        ],
        "full_text": "My best friend is Tom. He is very tall and kind. We often play together after school. We always help each other with our homework. I feel very happy when I am with him.",
        "full_text_cn": "我最好的朋友是 Tom。他又高又善良。放学后我们常常一起玩。我们总是互相帮忙做作业。和他在一起的时候，我觉得非常开心。",
        "explanation_cn": "这篇作文围绕最好的朋友展开，使用了5个关键词。注意：1) best friend 是固定搭配；2) tall and kind 用 and 连接两个形容词；3) play together 中 together 是副词；4) help each other 是互帮互助的意思；5) when 引导时间状语从句。整篇作文使用一般现在时，表达日常状态。",
        "explanation_en": "This essay is about a best friend, using 5 keywords. Notes: 1) 'best friend' is a fixed collocation; 2) 'tall and kind' uses 'and' to connect two adjectives; 3) 'together' is an adverb in 'play together'; 4) 'help each other' means mutual assistance; 5) 'when' introduces a time clause. The entire essay uses the simple present tense to express a routine state."
      },
      {
        "id": "fri-ket",
        "name_cn": "KET/PET题型",
        "type": "ket_pet",
        "duration": 10,
        "questions": [
          {
            "id": "fri-kp1",
            "type": "choice",
            "question": "KET: Choose the correct answer. — Where ___ you go yesterday? — I went to the cinema.",
            "options": [
              "do",
              "did",
              "were",
              "was"
            ],
            "answer": 1,
            "explanation_cn": "KET考试常见题型。yesterday 是过去时间标志词，疑问句用 did 提问，后面动词用原形 go。回答用过去式 went。注意一般过去时的疑问句结构：Did + 主语 + 动词原形?",
            "explanation_en": "This is a common KET exam question type. 'Yesterday' is a past time marker; questions use 'did' and the main verb stays in base form. The answer uses past tense 'went'. Structure: Did + subject + base verb?"
          },
          {
            "id": "fri-kp2",
            "type": "choice",
            "question": "KET: Choose the correct answer. There isn't ___ milk in the fridge.",
            "options": [
              "some",
              "any",
              "much",
              "many"
            ],
            "answer": 1,
            "explanation_cn": "KET语法题。否定句中用 any，不用 some。milk 是不可数名词，不能用 many。some 用于肯定句和礼貌请求（Would you like some...?）。any 用于否定句和疑问句。",
            "explanation_en": "KET grammar question. In negative sentences, we use 'any', not 'some'. 'Milk' is uncountable, so 'many' cannot be used. 'Some' is for affirmative sentences and polite requests (Would you like some...?). 'Any' is for negatives and questions."
          },
          {
            "id": "fri-kp3",
            "type": "choice",
            "question": "PET: Choose the correct answer. The book ___ by millions of readers since it was published.",
            "options": [
              "has read",
              "has been read",
              "read",
              "is reading"
            ],
            "answer": 1,
            "explanation_cn": "PET考试题型。主语 The book 和 read 是被动关系（书被读），用被动语态。since 引导的时间状语要求用现在完成时。所以用现在完成时的被动语态 has been read。结构：has/have been + 过去分词。",
            "explanation_en": "PET exam type. The subject 'The book' and 'read' have a passive relationship (the book is read), so passive voice is used. 'Since' requires the present perfect tense. So we use the present perfect passive: has been read. Structure: has/have been + past participle."
          },
          {
            "id": "fri-kp4",
            "type": "fill",
            "question": "PET: Complete the second sentence so that it means the same as the first. 'The room is too small for us to sit in.' = The room isn't ___ for us to sit in.",
            "answer": "big enough",
            "explanation_cn": "PET句型转换题。too...to...（太...而不能...）可以转换为 not...enough to...（不够...而不能...）。too small = not big enough。注意 enough 放在形容词后面：big enough，不是 enough big。",
            "explanation_en": "PET sentence transformation. 'Too...to...' (so...that...cannot) can be transformed to 'not...enough to...' (not sufficiently...to). too small = not big enough. Note: 'enough' comes after the adjective: 'big enough', not 'enough big'."
          },
          {
            "id": "fri-kp5",
            "type": "choice",
            "question": "KET: Choose the correct answer. — Would you like ___ tea? — Yes, please.",
            "options": [
              "any",
              "some",
              "a",
              "many"
            ],
            "answer": 1,
            "explanation_cn": "KET题型。Would you like...? 是礼貌邀请/提议，虽然形式上是疑问句，但用 some 不用 any。tea 是不可数名词，不能用 a。many 用于可数名词复数。这是 KET 常考考点。",
            "explanation_en": "KET question type. 'Would you like...?' is a polite offer. Although it's a question form, we use 'some', not 'any'. 'Tea' is uncountable, so 'a' is wrong. 'Many' is for plural countable nouns. This is a frequently tested KET point."
          }
        ]
      },
      {
        "id": "fri-grammar",
        "name_cn": "语法复习",
        "type": "grammar",
        "duration": 5,
        "questions": [
          {
            "id": "fri-gr1",
            "type": "choice",
            "question": "Neither Tom nor I ___ a student.",
            "options": [
              "am",
              "is",
              "are",
              "be"
            ],
            "answer": 0,
            "explanation_cn": "Neither...nor... 结构遵循就近原则，谓语动词与最近的主语一致。最近的主语是 I，所以用 am。注意区分 Either...or... 和 Neither...nor... 的用法，都遵循就近原则。",
            "explanation_en": "'Neither...nor...' follows the principle of proximity - the verb agrees with the nearest subject. The nearest subject is 'I', so 'am' is used. Note: both 'Either...or...' and 'Neither...nor...' follow this principle."
          },
          {
            "id": "fri-gr2",
            "type": "choice",
            "question": "The number of students in our class ___ 45.",
            "options": [
              "are",
              "is",
              "have",
              "has"
            ],
            "answer": 1,
            "explanation_cn": "The number of + 名词复数 + 单数谓语动词，表示...的数量是。注意区分 a number of + 复数名词 + 复数谓语（许多...）。这是常考易混点。The number of students is 45. A number of students are playing.",
            "explanation_en": "'The number of + plural noun + singular verb' means 'the quantity of... is'. Note the difference: 'a number of + plural noun + plural verb' means 'many...'. Example: The number of students is 45. A number of students are playing."
          },
          {
            "id": "fri-gr3",
            "type": "fill",
            "question": "If it ___ (not rain) tomorrow, we will go camping. [填入正确形式]",
            "answer": "doesn't rain",
            "explanation_cn": "这是条件状语从句，主将从现原则：主句用将来时 will go，从句用一般现在时。it 是第三人称单数，否定用 doesn't + 动词原形。所以是 doesn't rain。注意主将从现：主句将来时，if/when 引导的从句用现在时表将来。",
            "explanation_en": "This is a conditional clause with the 'main future, subordinate present' rule: the main clause uses future tense 'will go', and the subordinate clause uses present tense. 'It' is third person singular, negative form: doesn't + base verb. So: doesn't rain. Rule: main clause future, if/when clause uses present for future meaning."
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周六",
    "day_en": "Saturday",
    "is_speaking_day": true,
    "total_duration": 40,
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
            "explanation_en": "This question asks about weekend activities. 'On weekends' is American English; British English uses 'at weekends'. Use the simple present tense for habitual activities. Note: 'weekend' is a compound word: week + end."
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
            "explanation_en": "This question asks about favorite holidays. 'Spring Festival' is Chinese New Year. 'Red envelopes' are monetary gifts. Answer format: My favorite holiday is + holiday + because + reason. Common holidays: Christmas, Thanksgiving, Mid-Autumn Festival."
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
            "explanation_en": "This question asks about birthday celebration. 'Celebrate' means to mark a special occasion. Answers can include: have a party, eat birthday cake, invite friends. Note the spelling and stress of 'celebrate'."
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
            "explanation_en": "This is a subjunctive mood question. 'If + past tense, would + base verb' expresses a hypothetical situation about the present. Note: 'had' here is subjunctive, not past tense. 'Travel around the world' means to visit many countries globally."
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
            "explanation_en": "This question requires describing a book. Your answer should include: title, brief content summary, personal feelings. 'Recently' means lately and is often used with present perfect or past tense. 'Wizard' means a male magic user, 'magic school' means a school for learning magic."
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
            ]
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
            ]
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
            ]
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
            ]
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
            ]
          }
        ]
      },
      {
        "id": "sat-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 5,
        "passage": "Mike has a pet dog named Buddy. Buddy is a golden retriever with soft, shiny fur. Every morning, Mike takes Buddy for a walk in the park. Buddy loves running and chasing balls. Last week, Buddy saved a little boy who fell into the river. Everyone in the neighborhood thinks Buddy is a hero. Mike is very proud of his brave dog.",
        "passage_cn": "迈克有一只叫巴迪的宠物狗。巴迪是一只金毛寻回犬，有柔软闪亮的毛。每天早上，迈克带巴迪去公园散步。巴迪喜欢跑步和追球。上周，巴迪救了一个掉进河里的小男孩。社区里每个人都认为巴迪是个英雄。迈克为他勇敢的狗感到非常自豪。",
        "questions": [
          {
            "id": "sat-rd1",
            "type": "choice",
            "question": "What kind of dog is Buddy?",
            "options": [
              "A small dog",
              "A golden retriever",
              "A police dog",
              "A puppy"
            ],
            "answer": 1,
            "explanation_cn": "文章说 Buddy is a golden retriever。golden retriever 意为金毛寻回犬，是一种大型犬。注意 retriever /rɪˈtriːvə/ 的发音。soft, shiny fur 意为柔软闪亮的毛。",
            "explanation_en": "The text says 'Buddy is a golden retriever.' A golden retriever is a large breed of dog. Note the pronunciation of 'retriever' /rɪˈtriːvə/. 'Soft, shiny fur' means the dog's coat is smooth and glossy."
          },
          {
            "id": "sat-rd2",
            "type": "choice",
            "question": "What did Buddy do last week?",
            "options": [
              "He got lost",
              "He saved a boy",
              "He won a prize",
              "He was sick"
            ],
            "answer": 1,
            "explanation_cn": "文章说 Buddy saved a little boy who fell into the river。巴迪救了一个掉进河里的小男孩。saved 意为救了，fell into the river 意为掉进河里。注意 save 的过去式是 saved。",
            "explanation_en": "The text says 'Buddy saved a little boy who fell into the river.' 'Saved' means rescued. 'Fell into the river' means dropped into the water. Note: the past form of 'save' is 'saved'."
          },
          {
            "id": "sat-rd3",
            "type": "choice",
            "question": "How does Mike feel about Buddy?",
            "options": [
              "Sad",
              "Proud",
              "Angry",
              "Worried"
            ],
            "answer": 1,
            "explanation_cn": "文章最后一句说 Mike is very proud of his brave dog。迈克为他勇敢的狗感到自豪。proud 意为自豪的，be proud of 意为以...为豪。brave 意为勇敢的。",
            "explanation_en": "The last sentence says 'Mike is very proud of his brave dog.' 'Proud' means feeling satisfaction. 'Be proud of' means to take pride in someone/something. 'Brave' means showing courage."
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
        "id": "sun-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "Sarah is a 11-year-old girl who loves music. She started playing the piano when she was five years old. Now she can play many beautiful songs. Her music teacher says she has a great talent. Every day, she practices for one hour after finishing her homework. Her dream is to become a famous pianist and perform in concerts around the world.",
        "passage_cn": "莎拉是一个11岁的女孩，热爱音乐。她从五岁开始弹钢琴。现在她能弹奏许多优美的曲子。她的音乐老师说她很有天赋。每天，她做完作业后练习一小时。她的梦想是成为一名著名的钢琴家，在世界各地的音乐会上演出。",
        "questions": [
          {
            "id": "sun-rd1",
            "type": "choice",
            "question": "When did Sarah start playing the piano?",
            "options": [
              "At age 3",
              "At age 5",
              "At age 7",
              "At age 11"
            ],
            "answer": 1,
            "explanation_cn": "文章说 She started playing the piano when she was five years old。莎拉五岁开始弹钢琴。start doing sth 意为开始做某事。when 引导时间状语从句。",
            "explanation_en": "The text says 'She started playing the piano when she was five years old.' 'Start doing sth' means to begin an activity. 'When' introduces a time clause."
          },
          {
            "id": "sun-rd2",
            "type": "choice",
            "question": "How long does Sarah practice every day?",
            "options": [
              "30 minutes",
              "1 hour",
              "2 hours",
              "3 hours"
            ],
            "answer": 1,
            "explanation_cn": "文章说 she practices for one hour after finishing her homework。莎拉每天练习一小时。for one hour 意为一小时。after finishing her homework 意为做完作业后。注意 after + doing sth。",
            "explanation_en": "The text says 'she practices for one hour after finishing her homework.' 'For one hour' indicates duration. 'After finishing her homework' means completing homework first. Note: 'after + doing sth' structure."
          },
          {
            "id": "sun-rd3",
            "type": "choice",
            "question": "What is Sarah's dream?",
            "options": [
              "To be a singer",
              "To be a pianist",
              "To be a teacher",
              "To be a dancer"
            ],
            "answer": 1,
            "explanation_cn": "文章说 Her dream is to become a famous pianist and perform in concerts around the world。她的梦想是成为著名钢琴家并在世界各地的音乐会上演出。pianist 意为钢琴家，concert 意为音乐会。",
            "explanation_en": "The text says 'Her dream is to become a famous pianist and perform in concerts around the world.' A 'pianist' is someone who plays the piano professionally. A 'concert' is a live music performance."
          }
        ]
      },
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
            ]
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
            ]
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
            ]
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
            ]
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
            ]
          }
        ]
      },
      {
        "id": "sun-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "Peter is a 10-year-old boy. He 1___ in Shanghai with his parents. Every morning, he 2___ up at 6:30 and has breakfast at 7:00. His school is not far from his home, so he 3___ to school. His favorite 4___ is English because he likes reading English stories. After school, he often plays 5___ with his classmates. He is a happy boy.",
        "questions": [
          {
            "id": "sun-cz1",
            "type": "choice",
            "question": "1___",
            "options": [
              "lives",
              "live",
              "living",
              "to live"
            ],
            "answer": 0,
            "explanation_cn": "主语 He 是第三人称单数，一般现在时动词加 s：live → lives。live in 意为住在某地。注意第三人称单数变化规则：一般加 s，以 s/x/sh/ch/o 结尾加 es，辅音+y 变 ies。",
            "explanation_en": "The subject 'He' is third person singular; present tense verbs add -s: live → lives. 'Live in' means to reside in a place. Rules: generally add -s; add -es after s/x/sh/ch/o; change y to ies after consonant+y."
          },
          {
            "id": "sun-cz2",
            "type": "choice",
            "question": "2___",
            "options": [
              "get",
              "gets",
              "getting",
              "got"
            ],
            "answer": 1,
            "explanation_cn": "Every morning 表示经常性动作，用一般现在时。He 是第三人称单数，get → gets。get up 意为起床。注意区分 get up（起床）和 wake up（醒来）。",
            "explanation_en": "'Every morning' indicates habitual action, using the simple present tense. 'He' is third person singular: get → gets. 'Get up' means to rise from bed. Note: 'get up' (rise from bed) vs 'wake up' (become conscious)."
          },
          {
            "id": "sun-cz3",
            "type": "choice",
            "question": "3___",
            "options": [
              "walks",
              "drives",
              "flies",
              "swims"
            ],
            "answer": 0,
            "explanation_cn": "学校不远所以他走路去，用 walks。注意题目说 school is not far（学校不远），所以步行 walks。walk to school 意为步行去学校。注意区分 walk（步行）和 drive（开车）。",
            "explanation_en": "The school is not far, so he walks: 'walks'. The text says 'school is not far from his home, so he walks to school.' 'Walk to school' means to go on foot. Note: walk (on foot) vs drive (by car)."
          },
          {
            "id": "sun-cz4",
            "type": "choice",
            "question": "4___",
            "options": [
              "subject",
              "color",
              "food",
              "sport"
            ],
            "answer": 0,
            "explanation_cn": "后文说 because he likes reading English stories，所以 favorite subject 是 English。subject 意为科目。常用科目：English, Math, Science, Art, Music, PE。",
            "explanation_en": "The following text says 'because he likes reading English stories', so his favorite 'subject' is English. 'Subject' means a school course. Common subjects: English, Math, Science, Art, Music, PE."
          },
          {
            "id": "sun-cz5",
            "type": "choice",
            "question": "5___",
            "options": [
              "basketball",
              "breakfast",
              "homework",
              "piano"
            ],
            "answer": 0,
            "explanation_cn": "plays 后面接运动或乐器。plays basketball 打篮球，plays piano 弹钢琴。但 with his classmates 暗示是集体运动，选 basketball。注意 play + 运动（不加 the），play + 乐器（加 the）。",
            "explanation_en": "After 'plays', we need a sport or instrument. 'Plays basketball' (sport) or 'plays the piano' (instrument). 'With his classmates' suggests a team sport, so 'basketball'. Note: play + sport (no 'the'), play + instrument (with 'the')."
          }
        ]
      }
    ]
  }
];

// ============================================================================
// 多周轮换（v87）：每周 7 天一套内容，按自然周推进，难度逐周递增。
//   第 1 周 = 2026-09-28 那一周（原题库）；第 2/3/4 周为全新内容。
//   做过的题不再出现 —— 只要新增 WEEK5+，孩子的题库就一直往前走。
//   全部周用完后停在最难的一周（而不是回头重复）。
// HOMEWORK_DATA 仍然是一个 7 元素数组（周一..周日），app.js 其余代码零改动。
// ============================================================================

// 词汇条目生成器：把紧凑的词卡配置展开成完整的多阶段学习数据。
// 与第 1 周手写的条目同构（8 个阶段：learn / 看图选词×2 / 选释义×2 /
// 逐字母朗读 / 音节拼读 / 补全拼写），少写 90% 的重复 JSON。
function vocabWord(c) {
  const w = c.word;
  const stages = [
    { type: 'learn', instruction: '看图学单词' },
    { type: 'image_choice', prompt: '听发音，选图片（1/2）',
      options: [c.emoji, c.wrongEmoji[0], c.wrongEmoji[1], c.wrongEmoji[2]], answer: 0 },
    { type: 'image_choice', prompt: '听发音，选图片（2/2）',
      options: [c.wrongEmoji[2], c.wrongEmoji[0], c.emoji, c.wrongEmoji[1]], answer: 2 },
    { type: 'meaning_choice', prompt: w + ' 是什么意思？（1/2）',
      options: [c.wrongMeaning[0], c.wrongMeaning[1], c.meaning, c.wrongMeaning[2]], answer: 2 },
    { type: 'meaning_choice', prompt: w + ' 是什么意思？（2/2）',
      options: [c.meaning, c.wrongMeaning[2], c.wrongMeaning[0], c.wrongMeaning[1]], answer: 0 },
    { type: 'letter_read', prompt: '跟读字母（每个字母读两遍）' },
    { type: 'syllable_blend', prompt: '拼合音标（每个音节读两遍）' },
    { type: 'spell_fill', prompt: '补全拼写: ' + c.spell[0], answer: c.spell[1] }
  ];
  return {
    word: w, phonetic: c.phonetic, meaning: c.meaning, emoji: c.emoji,
    example_en: c.example_en, example_cn: c.example_cn,
    stages: stages, letters: w.split(''), syllables: c.syllables
  };
}

// ===== 第 2 周（A2 · KET 入门巩固）：学校生活 / 动物农场 / 四季 =====
const WEEK2 = [
  {
    "day_cn": "周一",
    "day_en": "Monday",
    "is_speaking_day": true,
    "total_duration": 40,
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
            "explanation_en": "Use 'What time' to ask about the clock. Answer with 'I get up at + time'. Note: 'get up' means to rise from bed, and 'at' goes before a specific time."
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
            "explanation_en": "'Favorite' means most liked. The question asks about food, so answer with a food. B and C answer different questions (color, subject); D uses the wrong tense. Pattern: 'My favorite food is...'"
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
            "explanation_en": "'Usually' is an adverb of frequency, so the simple present tense is used. A is correct; B is present continuous, C is past tense, and D does not answer the question."
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
            "explanation_en": "The fixed pattern for asking about weather is 'What's the weather like?' Answer with 'It is + weather adjective'. B uses past tense; C and D do not answer the question."
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
            "explanation_en": "The question asks what YOU do, so the answer must be your own action. A (I often wash the dishes) is correct; B talks about mother; C and D do not answer the question."
          }
        ]
      },
      {
        "id": "w2-mon-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          vocabWord({
            "word": "breakfast", "phonetic": "/ˈbrekfəst/", "meaning": "早餐", "emoji": "🍳",
            "example_en": "I have breakfast at seven.", "example_cn": "我七点吃早餐。",
            "syllables": ["break", "fast"], "spell": ["br__kfast", "ea"],
            "wrongEmoji": ["⭐", "🚗", "⚽"], "wrongMeaning": ["美味的", "蔬菜", "雨伞"]
          }),
          vocabWord({
            "word": "delicious", "phonetic": "/dɪˈlɪʃəs/", "meaning": "美味的", "emoji": "😋",
            "example_en": "The noodles are delicious.", "example_cn": "这面条很好吃。",
            "syllables": ["de", "li", "cious"], "spell": ["deli__ous", "ci"],
            "wrongEmoji": ["⭐", "🚲", "🌧️"], "wrongMeaning": ["早餐", "蔬菜", "雨伞"]
          }),
          vocabWord({
            "word": "vegetable", "phonetic": "/ˈvedʒtəbl/", "meaning": "蔬菜", "emoji": "🥕",
            "example_en": "Eat more vegetables every day.", "example_cn": "每天多吃蔬菜。",
            "syllables": ["ve", "ge", "ta", "ble"], "spell": ["veg__able", "et"],
            "wrongEmoji": ["⚽", "🎵", "🚗"], "wrongMeaning": ["早餐", "美味的", "雨伞"]
          }),
          vocabWord({
            "word": "umbrella", "phonetic": "/ʌmˈbrelə/", "meaning": "雨伞", "emoji": "☂️",
            "example_en": "Take an umbrella. It may rain.", "example_cn": "带上雨伞，可能会下雨。",
            "syllables": ["um", "brel", "la"], "spell": ["um__ella", "br"],
            "wrongEmoji": ["⭐", "🎶", "⚽"], "wrongMeaning": ["蔬菜", "美味的", "锻炼"]
          }),
          vocabWord({
            "word": "exercise", "phonetic": "/ˈeksəsaɪz/", "meaning": "锻炼；练习", "emoji": "🏃",
            "example_en": "Exercise makes you strong.", "example_cn": "锻炼让你强壮。",
            "syllables": ["exer", "cise"], "spell": ["ex__cise", "er"],
            "wrongEmoji": ["📖", "🍎", "☂️"], "wrongMeaning": ["雨伞", "蔬菜", "早餐"]
          })
        ]
      },
      {
        "id": "w2-mon-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 5,
        "passage": "Mia is a nine-year-old girl from Canada. Her school has a small garden behind the classroom. Every Monday, Mia waters the plants with her classmates. They grow tomatoes, carrots and beans. Last week, they picked their first carrots. The carrots were small but very sweet. Mia's teacher says vegetables from the garden taste better than those from the supermarket. Mia wants to grow strawberries next spring.",
        "passage_cn": "米娅是一个来自加拿大的九岁女孩。她的学校在教室后面有一个小花园。每周一，米娅和同学们一起给植物浇水。他们种了西红柿、胡萝卜和豆子。上周，他们摘了第一茬胡萝卜。胡萝卜很小，但是非常甜。米娅的老师说，花园里种的蔬菜比超市买的味道更好。米娅想明年春天种草莓。",
        "questions": [
          {
            "id": "w2-mon-rd1",
            "type": "choice",
            "question": "Where is Mia from?",
            "options": ["England", "Canada", "Australia", "America"],
            "answer": 1,
            "explanation_cn": "文章第一句说 Mia is a nine-year-old girl from Canada，所以米娅来自加拿大。注意 from 意为来自，be from = come from。",
            "explanation_en": "The first sentence says 'Mia is a nine-year-old girl from Canada', so Mia is from Canada. Note: 'from' shows where someone comes from."
          },
          {
            "id": "w2-mon-rd2",
            "type": "choice",
            "question": "What did the class pick last week?",
            "options": ["Some tomatoes", "Some beans", "Their first carrots", "Some strawberries"],
            "answer": 2,
            "explanation_cn": "文章说 Last week, they picked their first carrots。上周他们摘了第一茬胡萝卜。注意 pick 意为摘、采，strawberries 是他们明年才要种的。",
            "explanation_en": "The text says 'Last week, they picked their first carrots.' Note: 'pick' means to take fruit or vegetables from the plant. Strawberries are what Mia wants to grow next spring."
          },
          {
            "id": "w2-mon-rd3",
            "type": "choice",
            "question": "What does Mia want to grow next spring?",
            "options": ["Apples", "Potatoes", "Flowers", "Strawberries"],
            "answer": 3,
            "explanation_cn": "文章最后一句 Mia wants to grow strawberries next spring。米娅想明年春天种草莓。注意 want to do 意为想做某事，grow 意为种植。",
            "explanation_en": "The last sentence says 'Mia wants to grow strawberries next spring.' Note: 'want to do' means to wish to do something, and 'grow' here means to plant and raise."
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
        "passage": "Ben has a small brown dog called Lucky. Every morning, Ben feeds Lucky before he goes to school. One rainy afternoon, Ben found a wet kitten under a tree. It was cold and hungry. Ben took it home and dried it with a towel. His mother made a warm bed for the kitten. Now the kitten drinks milk every day and sleeps next to Lucky. Ben says Lucky is a good big brother.",
        "passage_cn": "本有一只叫 Lucky 的小棕狗。每天早上，本上学前先给 Lucky 喂食。一个下雨的下午，本在树下发现一只湿漉漉的小猫。它又冷又饿。本把它带回家，用毛巾把它擦干。妈妈为小猫做了一个温暖的窝。现在小猫每天喝牛奶，睡在 Lucky 旁边。本说 Lucky 是个好哥哥。",
        "questions": [
          {
            "id": "w2-tue-rd1",
            "type": "choice",
            "question": "What does Ben do every morning?",
            "options": ["He washes Lucky.", "He feeds Lucky.", "He walks Lucky in the park.", "He teaches Lucky tricks."],
            "answer": 1,
            "explanation_cn": "文章说 Every morning, Ben feeds Lucky before he goes to school。每天早上本先给 Lucky 喂食。注意 feed 意为喂食，before 引导时间状语从句。",
            "explanation_en": "The text says 'Every morning, Ben feeds Lucky before he goes to school.' Note: 'feed' means to give food to, and 'before' introduces a time clause."
          },
          {
            "id": "w2-tue-rd2",
            "type": "choice",
            "question": "Where did Ben find the kitten?",
            "options": ["Under a tree", "In the garden", "Near the school", "On the road"],
            "answer": 0,
            "explanation_cn": "文章说 Ben found a wet kitten under a tree。本在树下发现了小猫。注意 found 是 find 的过去式，wet 意为湿的。",
            "explanation_en": "The text says 'Ben found a wet kitten under a tree.' Note: 'found' is the past form of 'find', and 'wet' means covered with water."
          },
          {
            "id": "w2-tue-rd3",
            "type": "choice",
            "question": "What does the kitten do every day now?",
            "options": ["It eats fish.", "It drinks milk.", "It plays in the garden.", "It sleeps all day."],
            "answer": 1,
            "explanation_cn": "文章说 Now the kitten drinks milk every day and sleeps next to Lucky。现在小猫每天喝牛奶，睡在 Lucky 旁边。C 选项 it sleeps next to Lucky 只对了半句，D all day（整天）不对。",
            "explanation_en": "The text says 'Now the kitten drinks milk every day and sleeps next to Lucky.' Note: C is only half right — it sleeps next to Lucky, not all day."
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
            "question": "My sister ___ her teeth every morning.",
            "options": ["brush", "brushes", "brushing", "brushed"],
            "answer": 1,
            "explanation_cn": "主语 My sister 是第三人称单数，every morning 表示习惯，用一般现在时三单形式。brush 以 sh 结尾，加 -es：brushes。",
            "explanation_en": "'My sister' is third person singular and 'every morning' shows a habit, so the simple present with -s/-es is used. Verbs ending in -sh add -es: brush → brushes."
          },
          {
            "id": "w2-tue-gr2",
            "type": "choice",
            "question": "Be quiet! The baby ___.",
            "options": ["sleeps", "is sleeping", "slept", "sleep"],
            "answer": 1,
            "explanation_cn": "Be quiet! 提示动作正在进行，用现在进行时 is sleeping。注意进行时结构：be + 动词-ing。",
            "explanation_en": "'Be quiet!' shows the action is happening now, so the present continuous is used: is sleeping. Structure: be + verb-ing."
          },
          {
            "id": "w2-tue-gr3",
            "type": "fill",
            "question": "There ___ (be) some milk in the fridge. [填入正确形式]",
            "answer": "is",
            "explanation_cn": "There be 句型中动词和后面的名词一致。milk 是不可数名词，用 is。注意 some milk 表示一些牛奶，不可数名词没有复数形式。",
            "explanation_en": "In the 'there be' pattern, the verb agrees with the following noun. 'Milk' is uncountable, so we use 'is'. Note: uncountable nouns like milk have no plural form."
          },
          {
            "id": "w2-tue-gr4",
            "type": "choice",
            "question": "I ___ go swimming, because I can't swim.",
            "options": ["always", "usually", "never", "often"],
            "answer": 2,
            "explanation_cn": "后半句说我不会游泳，所以是从不去游泳，选 never（从不）。注意频度副词位置在实义动词前面：never go。",
            "explanation_en": "The second part says the speaker cannot swim, so the answer is 'never'. Note: adverbs of frequency come before the main verb: never go."
          },
          {
            "id": "w2-tue-gr5",
            "type": "fill",
            "question": "Would you like ___ (some/any) orange juice? [填 some 或 any]",
            "answer": "some",
            "explanation_cn": "Would you like...? 是礼貌的邀请或提议，虽然形式是疑问句，但要用 some 表示希望得到肯定回答。这是常考点。",
            "explanation_en": "'Would you like...?' is a polite offer. Although it looks like a question, we use 'some' because we expect the answer yes."
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
            "question": "___ your brother like playing basketball?",
            "options": ["Does", "Do", "Is", "Are"],
            "answer": 0,
            "explanation_cn": "主语 your brother 是第三人称单数，like 是实义动词，疑问句用 Does + 主语 + 动词原形。Do 用于复数或 I/you；Is/Are 后面不能直接跟动词原形 like。",
            "explanation_en": "'Your brother' is third person singular and 'like' is a main verb, so the question uses 'Does + subject + base verb'. 'Do' is for plurals and I/you; 'Is/Are' cannot be followed by the base verb 'like'."
          },
          {
            "id": "w2-tue-mc2",
            "type": "choice",
            "question": "The cat is sleeping ___ the sofa.",
            "options": ["under", "in", "on", "behind"],
            "answer": 2,
            "explanation_cn": "猫睡在沙发上用 on the sofa。under 在下面，in 在里面，behind 在后面。注意 on 表示在物体表面上。",
            "explanation_en": "Sleeping on a sofa uses 'on the sofa'. 'Under' = below, 'in' = inside, 'behind' = at the back. 'On' means on the surface of something."
          },
          {
            "id": "w2-tue-mc3",
            "type": "choice",
            "question": "— ___ is the weather today? — It's cloudy.",
            "options": ["What", "How", "Where", "Who"],
            "answer": 1,
            "explanation_cn": "问天气有两种句型：What's the weather like? 或 How is the weather? 本题空后面没有 like，所以选 How。注意两句意思完全一样。",
            "explanation_en": "There are two patterns for asking about weather: 'What's the weather like?' and 'How is the weather?' Since there is no 'like' after the blank, 'How' is correct."
          },
          {
            "id": "w2-tue-mc4",
            "type": "choice",
            "question": "We have no food at home. Let's buy ___.",
            "options": ["some", "any", "many", "much"],
            "answer": 0,
            "explanation_cn": "肯定句用 some；food 在这里泛指食物，是不可数名词，不能用 many。Let's 开头的句子是肯定祈使句，所以选 some。",
            "explanation_en": "'Some' is used in affirmative sentences. Here 'food' means food in general (uncountable), so 'many' is wrong. 'Let's...' is affirmative, so 'some' is correct."
          },
          {
            "id": "w2-tue-mc5",
            "type": "choice",
            "question": "My school bag is ___ than yours.",
            "options": ["heavy", "heavier", "heaviest", "more heavy"],
            "answer": 1,
            "explanation_cn": "than 是比较级的标志。heavy 是重读闭音节结尾的形容词，变比较级把 y 变 i 加 er：heavier。注意不是 more heavy。",
            "explanation_en": "'Than' is the marker of the comparative. Adjectives ending in consonant + y change y to i and add -er: heavy → heavier. Note: 'more heavy' is wrong."
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周三",
    "day_en": "Wednesday",
    "is_speaking_day": true,
    "total_duration": 40,
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
            "explanation_en": "'Last weekend' is past time, so the answer uses the past form 'went'. B is future, C is a habit (simple present), D is present."
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
            "explanation_en": "The question asks for your favorite animal. A answers directly; B answers about fruit; C and D are true facts but not answers to this question."
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
            "explanation_en": "A 'Do...?' question is answered with 'Yes, I do', not 'Yes, I am'. A is correct and adds what the speaker can cook; C does not say whether the speaker likes cooking."
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
            "explanation_en": "To talk about a dream job, use 'want to be + job'. A is correct; B uses the wrong verb (buy); C is a place; D does not answer the question."
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
            "explanation_en": "The question asks for your favorite season. A answers it; B is about a month; C states the current season; D is a general fact, not an answer."
          }
        ]
      },
      {
        "id": "w2-wed-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          vocabWord({
            "word": "panda", "phonetic": "/ˈpændə/", "meaning": "熊猫", "emoji": "🐼",
            "example_en": "The panda is eating bamboo.", "example_cn": "熊猫正在吃竹子。",
            "syllables": ["pan", "da"], "spell": ["p__nda", "a"],
            "wrongEmoji": ["⭐", "🚗", "⚽"], "wrongMeaning": ["竹子", "森林", "聪明的"]
          }),
          vocabWord({
            "word": "bamboo", "phonetic": "/bæmˈbuː/", "meaning": "竹子", "emoji": "🎋",
            "example_en": "Pandas love bamboo.", "example_cn": "熊猫喜欢竹子。",
            "syllables": ["bam", "boo"], "spell": ["ba__oo", "mb"],
            "wrongEmoji": ["⭐", "🌳", "🌧️"], "wrongMeaning": ["熊猫", "森林", "友好的"]
          }),
          vocabWord({
            "word": "forest", "phonetic": "/ˈfɒrɪst/", "meaning": "森林", "emoji": "🌲",
            "example_en": "Many animals live in the forest.", "example_cn": "许多动物住在森林里。",
            "syllables": ["fo", "rest"], "spell": ["fo__st", "re"],
            "wrongEmoji": ["⚽", "🎵", "🚗"], "wrongMeaning": ["熊猫", "竹子", "友好的"]
          }),
          vocabWord({
            "word": "clever", "phonetic": "/ˈklevə/", "meaning": "聪明的", "emoji": "💡",
            "example_en": "The fox is very clever.", "example_cn": "狐狸非常聪明。",
            "syllables": ["cle", "ver"], "spell": ["cle__er", "v"],
            "wrongEmoji": ["⭐", "🌧️", "🎸"], "wrongMeaning": ["森林", "竹子", "友好的"]
          }),
          vocabWord({
            "word": "friendly", "phonetic": "/ˈfrendli/", "meaning": "友好的", "emoji": "🤗",
            "example_en": "My new classmate is friendly.", "example_cn": "我的新同学很友好。",
            "syllables": ["friend", "ly"], "spell": ["frien__y", "dl"],
            "wrongEmoji": ["⭐", "🚲", "🎲"], "wrongMeaning": ["聪明的", "森林", "竹子"]
          })
        ]
      },
      {
        "id": "w2-wed-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 5,
        "passage": "Last Friday, Class 3 went to Green Farm by bus. The farmer, Mr Hill, showed them around. First, the children fed the hens and collected some eggs. Then they picked strawberries in the field. The strawberries were red and sweet. After lunch, Mr Hill let the children ride his old horse. It was slow but very gentle. On the way back, most of the children fell asleep on the bus. \"It was the best school trip ever,\" said Amy.",
        "passage_cn": "上周五，三班坐公交车去了绿色农场。农场主希尔先生带他们四处参观。孩子们先喂了母鸡，捡了一些鸡蛋。然后他们在地里摘草莓。草莓又红又甜。午饭过后，希尔先生让孩子们骑他那匹老马。马走得很慢，但是非常温顺。回去的路上，大多数孩子都在公交车上睡着了。艾米说：这是有史以来最棒的学校旅行。",
        "questions": [
          {
            "id": "w2-wed-rd1",
            "type": "choice",
            "question": "How did Class 3 go to the farm?",
            "options": ["On foot", "By bus", "By train", "By bike"],
            "answer": 1,
            "explanation_cn": "文章第一句 went to Green Farm by bus。坐公交车去的。注意 by + 交通工具表示出行方式：by bus/by car/by train。",
            "explanation_en": "The first sentence says 'went to Green Farm by bus'. Note: 'by + vehicle' shows how someone travels: by bus, by car, by train."
          },
          {
            "id": "w2-wed-rd2",
            "type": "choice",
            "question": "What did the children pick in the field?",
            "options": ["Apples", "Eggs", "Strawberries", "Beans"],
            "answer": 2,
            "explanation_cn": "文章说 Then they picked strawberries in the field。他们在地里摘的是草莓。Eggs 是 collected（捡）的，不是 picked。",
            "explanation_en": "The text says 'Then they picked strawberries in the field.' Eggs were 'collected', not picked."
          },
          {
            "id": "w2-wed-rd3",
            "type": "choice",
            "question": "What was the horse like?",
            "options": ["Fast and strong", "Slow but gentle", "Young and cute", "Old but fast"],
            "answer": 1,
            "explanation_cn": "文章说 It was slow but very gentle。马很慢但是非常温顺。gentle 意为温顺的、温和的。",
            "explanation_en": "The text says 'It was slow but very gentle.' Note: 'gentle' means kind and calm."
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
            "audio_text": "My little sister can count from one to fifty.",
            "options": [
              "My little sister can count from one to fifty.",
              "My little brother can count from one to fifty.",
              "My little sister can count from one to fifteen.",
              "My little sister can count from one to five."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：sister（姐妹）和 fifty（50）。注意区分 fifty /ˈfɪfti/ 和 fifteen /ˌfɪfˈtiːn/：fifty 重音在前，fifteen 重音在后。",
            "explanation_en": "Key words: 'sister' and 'fifty'. Note the difference: fifty /ˈfɪfti/ has stress on the first syllable; fifteen /ˌfɪfˈtiːn/ has stress on the second."
          },
          {
            "id": "w2-thu-ls2",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "The museum opens at nine in the morning.",
            "options": [
              "The museum opens at nine in the morning.",
              "The museum opens at nine in the evening.",
              "The museum closes at nine in the morning.",
              "The park opens at nine in the morning."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：museum（博物馆）、opens（开门）、nine（九点）、morning（早上）。注意 opens 和 closes 是反义词，听清楚动词是关键。",
            "explanation_en": "Key words: 'museum', 'opens', 'nine', 'morning'. Note that 'opens' and 'closes' are opposites — listen carefully for the verb."
          },
          {
            "id": "w2-thu-ls3",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "He is looking for his blue school bag.",
            "options": [
              "He is looking for his blue school bag.",
              "He is looking at his blue school bag.",
              "He is looking for his black school bag.",
              "She is looking for her blue school bag."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：looking for（在找）、blue（蓝色）、school bag（书包）。注意 look for 是寻找，look at 是看着，意思不同。blue /bluː/ 和 black /blæk/ 注意元音区别。",
            "explanation_en": "Key words: 'looking for', 'blue', 'school bag'. Note: 'look for' means to search, while 'look at' means to direct your eyes at something."
          },
          {
            "id": "w2-thu-ls4",
            "type": "fill",
            "question": "听到的数字是什么？",
            "audio_text": "The new bike costs two hundred and thirty yuan.",
            "answer": "230",
            "explanation_cn": "听力数字：two hundred and thirty (230)。注意 hundreds 百位的读法：two hundred + and + thirty。不要和 two thousand three hundred (2300) 混淆。",
            "explanation_en": "Number: two hundred and thirty (230). Note the pattern for hundreds: two hundred + and + thirty. Don't confuse it with two thousand three hundred (2300)."
          },
          {
            "id": "w2-thu-ls5",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "We are going to have a picnic this Saturday.",
            "options": [
              "We are going to have a picnic this Saturday.",
              "We are going to have a party this Saturday.",
              "We are going to have a picnic this Sunday.",
              "We had a picnic last Saturday."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：picnic（野餐）、this Saturday（这周六）。注意 be going to 表示计划要做的事。picnic /ˈpɪknɪk/ 重音在第一个音节。",
            "explanation_en": "Key words: 'picnic', 'this Saturday'. Note: 'be going to' shows a plan. Picnic /ˈpɪknɪk/ has stress on the first syllable."
          }
        ]
      },
      {
        "id": "w2-thu-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "It was sports day at Sunny School. The sun was 1___ in the blue sky. Lucy ran in the first race. She ran as 2___ as she could, and she won! Her classmates 3___ for her loudly. After the races, everyone watched the high jump. Tom jumped over the bar, but he 4___ the second time. He was a little sad. His teacher told him, \"Don't worry. You can win next 5___.\"",
        "questions": [
          {
            "id": "w2-thu-cz1",
            "type": "choice",
            "question": "1___",
            "options": ["bright", "rainy", "dark", "windy"],
            "answer": 0,
            "explanation_cn": "前文说天气晴朗（blue sky），太阳是明亮的，用 bright。bright 意为明亮的，in the blue sky 意为在蓝天中。",
            "explanation_en": "The sky is blue, so the sun is 'bright'. Note: 'bright' means giving a lot of light."
          },
          {
            "id": "w2-thu-cz2",
            "type": "choice",
            "question": "2___",
            "options": ["slowly", "high", "fast", "late"],
            "answer": 2,
            "explanation_cn": "赛跑要跑得快，而且她赢了，所以用 fast。as fast as she could 意为尽可能快地。注意 as...as 中间用原级。",
            "explanation_en": "It is a race and she won, so she ran as 'fast' as she could. Note: the structure 'as...as' takes the base form of the adjective or adverb."
          },
          {
            "id": "w2-thu-cz3",
            "type": "choice",
            "question": "3___",
            "options": ["asked", "cheered", "woke", "missed"],
            "answer": 1,
            "explanation_cn": "同学为她大声欢呼，用 cheered。cheer for sb 意为为某人加油欢呼。loudly 意为大声地。",
            "explanation_en": "Her classmates 'cheered' for her loudly. Note: 'cheer for somebody' means to shout in support of them."
          },
          {
            "id": "w2-thu-cz4",
            "type": "choice",
            "question": "4___",
            "options": ["won", "hit", "missed", "caught"],
            "answer": 2,
            "explanation_cn": "后文说他有点难过，说明第二次没跳过去，用 missed（未成功）。miss 意为未达到、错过。",
            "explanation_en": "He was a little sad afterwards, so he 'missed' the second time. Note: 'miss' here means to fail to clear the bar."
          },
          {
            "id": "w2-thu-cz5",
            "type": "choice",
            "question": "5___",
            "options": ["day", "time", "word", "year"],
            "answer": 1,
            "explanation_cn": "老师说下次你能赢，用 next time。next time 意为下一次，是常用搭配。",
            "explanation_en": "The teacher says he can win 'next time'. Note: 'next time' is a common fixed phrase."
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
            "question": "We ___ (go) to the park yesterday afternoon. [填入正确形式]",
            "answer": "went",
            "explanation_cn": "yesterday afternoon 是过去时间标志，用一般过去时。go 的过去式是 went，是不规则变化，要背下来。",
            "explanation_en": "'Yesterday afternoon' is a past time marker, so the simple past is used. 'Go' is irregular: go → went."
          },
          {
            "id": "w2-thu-tn2",
            "type": "fill",
            "question": "___ (be) you at home last night? [填入正确形式]",
            "answer": "Were",
            "explanation_cn": "last night 是过去时间，be 动词用过去式。主语是 you，所以用 Were。注意句首大写。was 用于 I/he/she/it，were 用于 you/we/they。",
            "explanation_en": "'Last night' is past time, so the past form of 'be' is needed. With the subject 'you', we use 'Were'. Note the capital letter at the start."
          },
          {
            "id": "w2-thu-tn3",
            "type": "fill",
            "question": "Listen! Someone ___ (sing) in the music room. [填入正确形式]",
            "answer": "is singing",
            "explanation_cn": "Listen! 是现在进行时标志词。结构 be + doing，主语 someone 是单数，用 is singing。",
            "explanation_en": "'Listen!' is a marker of the present continuous. Structure: be + verb-ing. 'Someone' is singular, so 'is singing'."
          },
          {
            "id": "w2-thu-tn4",
            "type": "fill",
            "question": "I ___ (buy) a new dictionary tomorrow. [填入正确形式]",
            "answer": "will buy",
            "explanation_cn": "tomorrow 是将来时间标志，用 will + 动词原形：will buy。也可以说 am going to buy。buy 的过去式是 bought，注意区分。",
            "explanation_en": "'Tomorrow' is a future time marker, so 'will + base verb' is used: will buy. 'Am going to buy' is also correct. Note: the past form of 'buy' is 'bought'."
          },
          {
            "id": "w2-thu-tn5",
            "type": "choice",
            "question": "My parents ___ in Beijing in 2018.",
            "options": ["live", "lives", "lived", "are living"],
            "answer": 2,
            "explanation_cn": "in 2018 是过去的时间点，用一般过去时 lived。live 的过去式直接加 d。注意 in + 年份 与过去时连用。",
            "explanation_en": "'In 2018' is a point of time in the past, so the simple past 'lived' is used. Note: 'in + year' goes with the past tense."
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周五",
    "day_en": "Friday",
    "is_speaking_day": false,
    "total_duration": 30,
    "theme_cn": "模板写作 + KET/PET题型 + 语法复习",
    "modules": [
      {
        "id": "w2-fri-writing",
        "name_cn": "写作练习",
        "type": "writing_template",
        "duration": 15,
        "title": "My Favorite Animal",
        "requirement_cn": "请根据关键词提示完成作文，完成后请背诵全文。明天将进行挖空默写测试！",
        "keywords": [
          "favorite animal",
          "black and white",
          "eat bamboo",
          "climb trees",
          "lovely"
        ],
        "keywords_cn": [
          "最喜欢的动物",
          "黑白相间",
          "吃竹子",
          "爬树",
          "可爱的"
        ],
        "template": "My {{1}} is the panda. Pandas are {{2}}. They {{3}} every day. They can also {{4}}. I think pandas are very {{5}}.",
        "blanks": [
          { "id": 1, "hint_cn": "最喜欢的动物", "hint_en": "favorite animal", "answer": "favorite animal" },
          { "id": 2, "hint_cn": "黑白相间", "hint_en": "black and white", "answer": "black and white" },
          { "id": 3, "hint_cn": "吃竹子", "hint_en": "eat bamboo", "answer": "eat bamboo" },
          { "id": 4, "hint_cn": "爬树", "hint_en": "climb trees", "answer": "climb trees" },
          { "id": 5, "hint_cn": "可爱的", "hint_en": "lovely", "answer": "lovely" }
        ],
        "full_text": "My favorite animal is the panda. Pandas are black and white. They eat bamboo every day. They can also climb trees. I think pandas are very lovely.",
        "full_text_cn": "我最喜欢的动物是熊猫。熊猫黑白相间。它们每天吃竹子。它们还会爬树。我觉得熊猫非常可爱。",
        "explanation_cn": "这篇作文围绕最喜欢的动物展开，使用了5个关键词。注意：1) favorite animal 最喜欢的动物；2) black and white 用 and 连接两个颜色；3) eat bamboo 中 bamboo 是不可数名词；4) climb trees 会爬树，can 后面用动词原形；5) lovely 可爱的。整篇使用一般现在时。",
        "explanation_en": "This essay is about a favorite animal, using 5 keywords. Notes: 1) 'favorite animal'; 2) 'black and white' joins two colors with 'and'; 3) 'bamboo' is uncountable; 4) after 'can', use the base verb 'climb trees'; 5) 'lovely' means cute. The whole essay uses the simple present tense."
      },
      {
        "id": "w2-fri-ket",
        "name_cn": "KET/PET题型",
        "type": "ket_pet",
        "duration": 10,
        "questions": [
          {
            "id": "w2-fri-kp1",
            "type": "choice",
            "question": "KET: Choose the correct answer. — ___ I borrow your pencil, please? — Sure, here you are.",
            "options": ["Am", "May", "Does", "Was"],
            "answer": 1,
            "explanation_cn": "KET 交际用语。请求许可用 May I...? 意为我可以……吗？比 Can I 更礼貌。回答 Sure, here you are 意为当然可以，给你。",
            "explanation_en": "KET communication item. Ask for permission with 'May I...?', which is more polite than 'Can I?'. The reply 'Sure, here you are' means yes, take it."
          },
          {
            "id": "w2-fri-kp2",
            "type": "choice",
            "question": "KET: Choose the correct answer. There are ___ clouds in the sky, but it isn't raining.",
            "options": ["some", "any", "no", "much"],
            "answer": 0,
            "explanation_cn": "clouds 是可数名词复数，肯定句用 some。any 用于否定和疑问；no 后面不能接复数名词表达有的意思时要小心：There are no clouds 意为没有云，和后半句矛盾。",
            "explanation_en": "'Clouds' is a plural countable noun in an affirmative sentence, so 'some' is used. 'No clouds' would mean there are no clouds, which contradicts the second half."
          },
          {
            "id": "w2-fri-kp3",
            "type": "choice",
            "question": "KET: Choose the correct answer. — What ___ your mother do? — She is a nurse.",
            "options": ["do", "does", "is", "has"],
            "answer": 1,
            "explanation_cn": "问职业的固定句型：What do/does + 主语 + do? 主语 your mother 是第三人称单数，用 does。回答 She is a nurse。",
            "explanation_en": "The fixed pattern for asking about jobs is 'What do/does + subject + do?' With 'your mother' (third person singular), use 'does'."
          },
          {
            "id": "w2-fri-kp4",
            "type": "choice",
            "question": "KET: Choose the correct answer. Tom is ___ than his brother.",
            "options": ["tall", "taller", "tallest", "more tall"],
            "answer": 1,
            "explanation_cn": "than 是比较级标志，tall 的比较级直接加 er：taller。最高级 tallest 前面要加 the，且不和 than 连用。",
            "explanation_en": "'Than' signals the comparative: tall → taller. The superlative 'tallest' needs 'the' and is not used with 'than'."
          },
          {
            "id": "w2-fri-kp5",
            "type": "fill",
            "question": "KET: Complete the sentence with one word. I go to school ___ bus every day.",
            "answer": "by",
            "explanation_cn": "KET 词汇题。by + 交通工具表示出行方式：by bus。注意 on foot 是步行，这是唯一不用 by 的常见表达。",
            "explanation_en": "KET vocabulary item. 'By + vehicle' shows how someone travels: by bus. Note: 'on foot' is the common exception without 'by'."
          }
        ]
      },
      {
        "id": "w2-fri-grammar",
        "name_cn": "语法复习",
        "type": "grammar",
        "duration": 5,
        "questions": [
          {
            "id": "w2-fri-gr1",
            "type": "choice",
            "question": "Lily and Lucy ___ twins.",
            "options": ["is", "am", "are", "be"],
            "answer": 2,
            "explanation_cn": "主语 Lily and Lucy 是两个人，复数用 are。注意 and 连接两个主语时谓语用复数。",
            "explanation_en": "'Lily and Lucy' are two people, so the plural 'are' is used. Note: subjects joined by 'and' take a plural verb."
          },
          {
            "id": "w2-fri-gr2",
            "type": "choice",
            "question": "— ___ do you like pandas? — Because they are cute.",
            "options": ["Why", "What", "How", "Where"],
            "answer": 0,
            "explanation_cn": "回答用 Because（因为），提问就用 Why（为什么）。Why 和 Because 是一对。",
            "explanation_en": "The answer starts with 'Because', so the question word is 'Why'. 'Why' and 'because' go together."
          },
          {
            "id": "w2-fri-gr3",
            "type": "fill",
            "question": "How many ___ (box) are there on the desk? [填入正确形式]",
            "answer": "boxes",
            "explanation_cn": "How many 后面接可数名词复数。box 以 x 结尾，变复数加 -es：boxes。",
            "explanation_en": "'How many' is followed by a plural countable noun. Nouns ending in -x add -es: box → boxes."
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周六",
    "day_en": "Saturday",
    "is_speaking_day": true,
    "total_duration": 40,
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
            "explanation_en": "The question asks about a habit, so use the simple present. A is correct; B is past; C and D do not answer the question."
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
            "explanation_en": "A 'Can...?' question is answered with 'Yes, I can'. Note: 'the' goes before instruments: play the piano. Liking music (B) is not the same as playing an instrument."
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
            "explanation_en": "'Who' asks about a person, so name the person. A is correct and adds the relationship; B only gives a fact; C and D do not answer the question."
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
            "explanation_en": "'Yesterday' requires the past form 'had'. B is a present habit; C is future; D does not say what was eaten."
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
            "explanation_en": "The question asks about your attitude, so answer with yes/no plus a reason. 'Not really' is a natural soft no. Note: 'tiring' describes the activity; 'tired' describes how a person feels."
          }
        ]
      },
      {
        "id": "w2-sat-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          vocabWord({
            "word": "guitar", "phonetic": "/ɡɪˈtɑː/", "meaning": "吉他", "emoji": "🎸",
            "example_en": "He plays the guitar very well.", "example_cn": "他吉他弹得很好。",
            "syllables": ["gui", "tar"], "spell": ["g__tar", "ui"],
            "wrongEmoji": ["⭐", "🚗", "⚽"], "wrongMeaning": ["绘画", "国际象棋", "相机"]
          }),
          vocabWord({
            "word": "painting", "phonetic": "/ˈpeɪntɪŋ/", "meaning": "绘画；画作", "emoji": "🎨",
            "example_en": "Her painting won a prize.", "example_cn": "她的画得奖了。",
            "syllables": ["pain", "ting"], "spell": ["pa__ting", "in"],
            "wrongEmoji": ["⭐", "🌧️", "🎲"], "wrongMeaning": ["吉他", "奖品", "国际象棋"]
          }),
          vocabWord({
            "word": "chess", "phonetic": "/tʃes/", "meaning": "国际象棋", "emoji": "♟️",
            "example_en": "My grandpa teaches me chess.", "example_cn": "爷爷教我下国际象棋。",
            "syllables": ["chess"], "spell": ["ch__ss", "e"],
            "wrongEmoji": ["⚽", "🎵", "🚲"], "wrongMeaning": ["绘画", "吉他", "相机"]
          }),
          vocabWord({
            "word": "camera", "phonetic": "/ˈkæmrə/", "meaning": "相机", "emoji": "📷",
            "example_en": "Don't forget your camera.", "example_cn": "别忘了带相机。",
            "syllables": ["ca", "me", "ra"], "spell": ["ca__ra", "me"],
            "wrongEmoji": ["⭐", "🎸", "🌧️"], "wrongMeaning": ["国际象棋", "绘画", "奖品"]
          }),
          vocabWord({
            "word": "prize", "phonetic": "/praɪz/", "meaning": "奖品", "emoji": "🏆",
            "example_en": "He got a prize for his painting.", "example_cn": "他的画得了奖。",
            "syllables": ["prize"], "spell": ["pr__e", "iz"],
            "wrongEmoji": ["⭐", "🎲", "🚲"], "wrongMeaning": ["相机", "国际象棋", "绘画"]
          })
        ]
      },
      {
        "id": "w2-sat-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 5,
        "passage": "There was an art show at Rainbow School last Thursday. The hall was full of paintings and photos. Amy showed three paintings of the sea. She used blue, white and green. A judge from the city art club looked at every piece carefully. In the end, Amy won the first prize! She got a new set of colour pencils and a book about famous painters. \"Keep practising,\" the judge told her. \"You have a good eye for colour.\" Amy wants to be a painter like her uncle one day.",
        "passage_cn": "上周四，彩虹学校举办了一场美术展。大厅里挂满了绘画和摄影作品。艾米展出了三幅海的画，用了蓝色、白色和绿色。一位来自市艺术俱乐部的评委仔细看了每一件作品。最后，艾米获得了一等奖！她得到了一盒新彩铅和一本关于著名画家的书。评委对她说：坚持练习，你对色彩很有感觉。艾米想有一天成为像她叔叔一样的画家。",
        "questions": [
          {
            "id": "w2-sat-rd1",
            "type": "choice",
            "question": "When was the art show?",
            "options": ["Last Tuesday", "Last Thursday", "Last Saturday", "Last Sunday"],
            "answer": 1,
            "explanation_cn": "第一句 There was an art show... last Thursday。美术展是上周四举办的。注意 there was 是 there is 的过去式。",
            "explanation_en": "The first sentence says the show was 'last Thursday'. Note: 'there was' is the past form of 'there is'."
          },
          {
            "id": "w2-sat-rd2",
            "type": "choice",
            "question": "What did Amy paint?",
            "options": ["The mountains", "Animals", "The sea", "Her school"],
            "answer": 2,
            "explanation_cn": "文章说 Amy showed three paintings of the sea。艾米画的是大海。注意 painting 意为画作，show 意为展出。",
            "explanation_en": "The text says 'Amy showed three paintings of the sea.' Note: 'painting' means a picture made with paint."
          },
          {
            "id": "w2-sat-rd3",
            "type": "choice",
            "question": "What did Amy get as the prize?",
            "options": [
              "A new set of colour pencils and a book",
              "A new camera",
              "A bag of paints",
              "A gold medal"
            ],
            "answer": 0,
            "explanation_cn": "文章说 She got a new set of colour pencils and a book about famous painters。奖品是一盒新彩铅和一本书。a set of 意为一套。",
            "explanation_en": "The text says 'She got a new set of colour pencils and a book about famous painters.' Note: 'a set of' means one group of things."
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
        "id": "w2-sun-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "In my town, every season is different. Spring is warm and rainy. Flowers come out and birds sing in the trees. Summer is hot. Children love swimming in the river and eating ice cream. Autumn is my favorite season. It is cool and the leaves turn yellow and red. We often fly kites in the park. Winter is cold and it sometimes snows. My brother and I make a big snowman in front of our house. Which season do you like best?",
        "passage_cn": "在我的小镇，每个季节都不一样。春天温暖多雨，花儿开放，鸟儿在树上唱歌。夏天很热，孩子们喜欢在河里游泳、吃冰淇淋。秋天是我最喜欢的季节，天气凉爽，树叶变成黄色和红色。我们常在公园里放风筝。冬天很冷，有时会下雪。我和哥哥在房前堆一个大雪人。你最喜欢哪个季节？",
        "questions": [
          {
            "id": "w2-sun-rd1",
            "type": "choice",
            "question": "What is the weather like in spring?",
            "options": ["Hot and dry", "Warm and rainy", "Cool and windy", "Cold and snowy"],
            "answer": 1,
            "explanation_cn": "文章说 Spring is warm and rainy。春天温暖多雨。注意 come out 意为（花）开放。",
            "explanation_en": "The text says 'Spring is warm and rainy.' Note: 'come out' means flowers open."
          },
          {
            "id": "w2-sun-rd2",
            "type": "choice",
            "question": "What is the writer's favorite season?",
            "options": ["Spring", "Summer", "Autumn", "Winter"],
            "answer": 2,
            "explanation_cn": "文章说 Autumn is my favorite season。作者最喜欢的季节是秋天。fly kites 意为放风筝。",
            "explanation_en": "The text says 'Autumn is my favorite season.' Note: 'fly kites' means to play with kites in the wind."
          },
          {
            "id": "w2-sun-rd3",
            "type": "choice",
            "question": "What do the children do in winter?",
            "options": ["Fly kites", "Swim in the river", "Make a snowman", "Eat ice cream"],
            "answer": 2,
            "explanation_cn": "文章说 My brother and I make a big snowman in front of our house。冬天孩子们堆雪人。注意 in front of 意为在……前面。",
            "explanation_en": "The text says 'My brother and I make a big snowman in front of our house.' Note: 'in front of' means before something."
          }
        ]
      },
      {
        "id": "w2-sun-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          vocabWord({
            "word": "spring", "phonetic": "/sprɪŋ/", "meaning": "春天", "emoji": "🌷",
            "example_en": "Flowers come out in spring.", "example_cn": "春天花儿开放。",
            "syllables": ["spring"], "spell": ["s__ing", "pr"],
            "wrongEmoji": ["⭐", "⛄", "🍂"], "wrongMeaning": ["风筝", "雪人", "野餐"]
          }),
          vocabWord({
            "word": "kite", "phonetic": "/kaɪt/", "meaning": "风筝", "emoji": "🪁",
            "example_en": "Let's fly a kite in the park.", "example_cn": "我们去公园放风筝吧。",
            "syllables": ["kite"], "spell": ["k__e", "it"],
            "wrongEmoji": ["⭐", "🎵", "🚗"], "wrongMeaning": ["春天", "秋天", "野餐"]
          }),
          vocabWord({
            "word": "autumn", "phonetic": "/ˈɔːtəm/", "meaning": "秋天", "emoji": "🍂",
            "example_en": "Autumn is cool and golden.", "example_cn": "秋天凉爽，一片金黄。",
            "syllables": ["au", "tumn"], "spell": ["au__mn", "tu"],
            "wrongEmoji": ["⭐", "☂️", "⚽"], "wrongMeaning": ["风筝", "野餐", "雪人"]
          }),
          vocabWord({
            "word": "snowman", "phonetic": "/ˈsnəʊmæn/", "meaning": "雪人", "emoji": "⛄",
            "example_en": "We made a snowman yesterday.", "example_cn": "我们昨天堆了个雪人。",
            "syllables": ["snow", "man"], "spell": ["snow__an", "m"],
            "wrongEmoji": ["⭐", "🌷", "🚲"], "wrongMeaning": ["秋天", "春天", "野餐"]
          }),
          vocabWord({
            "word": "picnic", "phonetic": "/ˈpɪknɪk/", "meaning": "野餐", "emoji": "🧺",
            "example_en": "We had a picnic by the lake.", "example_cn": "我们在湖边野餐了。",
            "syllables": ["pic", "nic"], "spell": ["pic__ic", "n"],
            "wrongEmoji": ["⭐", "🎸", "🎲"], "wrongMeaning": ["雪人", "风筝", "秋天"]
          })
        ]
      },
      {
        "id": "w2-sun-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "Last summer, Jack's family spent a day at the beach. The sky was clear and the sea was 1___. Jack and his sister built a big sandcastle near the water. Then they 2___ shells on the sand. The shells were in many different 3___ — some were white and some were pink. At noon, they ate sandwiches 4___ a big umbrella. Before they left, Jack looked at the clean beach and 5___ happily. It was a perfect day.",
        "questions": [
          {
            "id": "w2-sun-cz1",
            "type": "choice",
            "question": "1___",
            "options": ["blue", "brown", "dark", "soft"],
            "answer": 0,
            "explanation_cn": "天空晴朗（clear），海水应该是蓝色的，用 blue。the sea was blue 意为海水是蓝色的。",
            "explanation_en": "The sky was clear, so the sea was 'blue'. Note: 'clear' means without clouds."
          },
          {
            "id": "w2-sun-cz2",
            "type": "choice",
            "question": "2___",
            "options": ["bought", "collected", "lost", "made"],
            "answer": 1,
            "explanation_cn": "他们在沙滩上捡贝壳，用 collected。collect shells 意为收集贝壳。bought 是买的，沙滩上的贝壳不用买。",
            "explanation_en": "They gathered shells on the sand, so 'collected' is right. Note: 'collect' means to gather things; you don't buy shells on a beach."
          },
          {
            "id": "w2-sun-cz3",
            "type": "choice",
            "question": "3___",
            "options": ["colours", "animals", "boats", "boxes"],
            "answer": 0,
            "explanation_cn": "后面说有的白有的粉，说的是颜色，用 colours。in many different colours 意为有各种不同的颜色。",
            "explanation_en": "The next words say some were white and some were pink — those are 'colours'. Note: 'in many different colours' means in many different colours."
          },
          {
            "id": "w2-sun-cz4",
            "type": "choice",
            "question": "4___",
            "options": ["under", "on", "behind", "into"],
            "answer": 0,
            "explanation_cn": "在大伞下面吃三明治，用 under。under a big umbrella 意为在一把大伞下。",
            "explanation_en": "They ate under a big umbrella, so 'under' is correct. 'Under' means directly below."
          },
          {
            "id": "w2-sun-cz5",
            "type": "choice",
            "question": "5___",
            "options": ["cried", "smiled", "forgot", "shouted"],
            "answer": 1,
            "explanation_cn": "后文说 It was a perfect day，杰克开心地看着干净的沙滩，用 smiled（微笑）。happily 意为开心地。",
            "explanation_en": "It was a perfect day, so Jack 'smiled' happily. Note: 'smile' means to make a happy face."
          }
        ]
      }
    ]
  }
];


// ===== 第 3 周（A2+ · KET 核心）：完成时入门 / 比较等级 / 探索与博物馆 =====
const WEEK3 = [
  {
    "day_cn": "周一",
    "day_en": "Monday",
    "is_speaking_day": true,
    "total_duration": 40,
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
            "explanation_en": "'How long' asks about a duration, so the present perfect 'have lived + for + period' is used. B answers a different question; C is a past point; D is future."
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
            "explanation_en": "'Be good at + noun/verb-ing' means to be skilled at something. A is correct; B uses the wrong pattern ('good to' means kind to); C says what you are doing now; D does not answer."
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
            "explanation_en": "'Usually' means a habit, so the simple present is used. A is correct; B answers about lunch; C is past; D is future."
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
            "explanation_en": "'What is...like?' asks for a description. A describes the area; B does not answer; C is about family; D only says you like your neighbors."
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
            "explanation_en": "'Last birthday' is past time, so the past form 'had' is used. B is a present habit; C is future; D does not answer what you did."
          }
        ]
      },
      {
        "id": "w3-mon-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          vocabWord({
            "word": "journey", "phonetic": "/ˈdʒɜːni/", "meaning": "旅行；旅程", "emoji": "🧳",
            "example_en": "The journey took three hours.", "example_cn": "这段旅程花了三个小时。",
            "syllables": ["jour", "ney"], "spell": ["j__rney", "ou"],
            "wrongEmoji": ["⭐", "🏝️", "💎"], "wrongMeaning": ["岛屿", "宝藏", "勇敢的"]
          }),
          vocabWord({
            "word": "island", "phonetic": "/ˈaɪlənd/", "meaning": "岛屿", "emoji": "🏝️",
            "example_en": "They sailed to a small island.", "example_cn": "他们航行到了一座小岛。",
            "syllables": ["is", "land"], "spell": ["is__nd", "la"],
            "wrongEmoji": ["⭐", "🧳", "🛟"], "wrongMeaning": ["旅程", "宝藏", "营救"]
          }),
          vocabWord({
            "word": "treasure", "phonetic": "/ˈtreʒə/", "meaning": "宝藏；珍宝", "emoji": "💎",
            "example_en": "The pirates looked for treasure.", "example_cn": "海盗们寻找宝藏。",
            "syllables": ["trea", "sure"], "spell": ["tr__sure", "ea"],
            "wrongEmoji": ["⭐", "🌧️", "🎲"], "wrongMeaning": ["岛屿", "旅程", "营救"]
          }),
          vocabWord({
            "word": "brave", "phonetic": "/breɪv/", "meaning": "勇敢的", "emoji": "🦁",
            "example_en": "The brave boy saved the cat.", "example_cn": "勇敢的男孩救了猫。",
            "syllables": ["brave"], "spell": ["br__e", "av"],
            "wrongEmoji": ["⭐", "🚗", "⚽"], "wrongMeaning": ["宝藏", "岛屿", "旅程"]
          }),
          vocabWord({
            "word": "rescue", "phonetic": "/ˈreskjuː/", "meaning": "营救", "emoji": "🛟",
            "example_en": "Firemen rescued the little dog.", "example_cn": "消防员救了小狗。",
            "syllables": ["res", "cue"], "spell": ["res__e", "cu"],
            "wrongEmoji": ["⭐", "🎸", "🚲"], "wrongMeaning": ["勇敢的", "宝藏", "岛屿"]
          })
        ]
      },
      {
        "id": "w3-mon-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 5,
        "passage": "Sam's grandfather lives in a lighthouse on a small island. Last summer, Sam took a boat to visit him. Every evening, Grandfather climbs the stairs and turns on the big light. It helps ships find their way in the dark. One stormy night, the big light stopped working. Grandfather was not worried. He lit an old lamp and hung it high on the balcony. The light was small, but the sailors could still see it. In the morning, a ship blew its horn to say thank you.",
        "passage_cn": "萨姆的爷爷住在小岛上的一座灯塔里。去年夏天，萨姆坐船去看他。每天傍晚，爷爷爬上楼梯，打开那盏大灯。它帮助轮船在黑暗中找到方向。一个暴风雨的夜晚，大灯坏了。爷爷一点儿也不慌。他点亮一盏旧灯，挂在阳台的高处。灯光很小，但水手们仍然能看见。第二天早上，一艘轮船鸣笛表示感谢。",
        "questions": [
          {
            "id": "w3-mon-rd1",
            "type": "choice",
            "question": "How did Sam get to the island?",
            "options": ["By train", "By plane", "By boat", "By car"],
            "answer": 2,
            "explanation_cn": "文章说 Sam took a boat to visit him。萨姆是坐船去的。注意 take a boat 意为乘船。",
            "explanation_en": "The text says 'Sam took a boat to visit him.' Note: 'take a boat' means to travel by boat."
          },
          {
            "id": "w3-mon-rd2",
            "type": "choice",
            "question": "What happened on the stormy night?",
            "options": [
              "The stairs broke.",
              "The big light stopped working.",
              "A ship hit the island.",
              "The lamp fell down."
            ],
            "answer": 1,
            "explanation_cn": "文章说 One stormy night, the big light stopped working。大灯坏了。注意 stop doing 意为停止做某事，stormy 意为暴风雨的。",
            "explanation_en": "The text says 'One stormy night, the big light stopped working.' Note: 'stormy' means with strong wind and rain."
          },
          {
            "id": "w3-mon-rd3",
            "type": "choice",
            "question": "What did Grandfather do to help the ships?",
            "options": [
              "He lit an old lamp and hung it high.",
              "He called the sailors on the phone.",
              "He fixed the big light at once.",
              "He asked Sam to climb the stairs."
            ],
            "answer": 0,
            "explanation_cn": "文章说 He lit an old lamp and hung it high on the balcony。他点亮旧灯挂到高处。light 的过去式是 lit，hang-hung 意为挂。",
            "explanation_en": "The text says 'He lit an old lamp and hung it high on the balcony.' Note: 'lit' is the past of 'light', and 'hung' is the past of 'hang'."
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
        "passage": "On her way home, Lily saw a wallet lying on the ground. She picked it up and opened it. There was a lot of money and an ID card inside. The card showed a man's name and address. Lily went to the address with her mother. The man was very surprised and thankful. He offered Lily some money, but she said no. \"It is not my money,\" she said. The next day, a letter from the man arrived at Lily's school. Her teacher read it to the whole class. Everyone clapped for Lily.",
        "passage_cn": "在回家路上，莉莉看见地上有一个钱包。她捡起来打开，里面有很多钱和一张身份证。身份证上写着一位男士的姓名和地址。莉莉和妈妈一起去了那个地址。那位男士又惊讶又感激。他要给莉莉一些钱，但她拒绝了。她说：这不是我的钱。第二天，那位男士的一封寄到了莉莉的学校。老师把信念给全班听，大家都为莉莉鼓掌。",
        "questions": [
          {
            "id": "w3-tue-rd1",
            "type": "choice",
            "question": "What was inside the wallet?",
            "options": [
              "A lot of money and an ID card",
              "A letter and some photos",
              "A student card and some money",
              "Nothing but a name"
            ],
            "answer": 0,
            "explanation_cn": "文章说 There was a lot of money and an ID card inside。钱包里有很多钱和一张身份证。inside 意为在里面。",
            "explanation_en": "The text says 'There was a lot of money and an ID card inside.' Note: 'inside' means in the inner part."
          },
          {
            "id": "w3-tue-rd2",
            "type": "choice",
            "question": "Why did Lily go to the address?",
            "options": [
              "To visit her friend",
              "To return the wallet to its owner",
              "To buy something for her mother",
              "To look for her lost money"
            ],
            "answer": 1,
            "explanation_cn": "身份证上有男士的姓名和地址，莉莉去那里是为了把钱包还给失主。注意 owner 意为失主、主人，return 意为归还。",
            "explanation_en": "The card showed the owner's name and address, so Lily went to give the wallet back. Note: 'owner' means the person something belongs to, and 'return' means to give back."
          },
          {
            "id": "w3-tue-rd3",
            "type": "choice",
            "question": "What can we learn from the story?",
            "options": [
              "Lily kept the money for herself.",
              "Lily was honest and did not want a reward.",
              "The man was angry with Lily.",
              "The teacher gave Lily a prize."
            ],
            "answer": 1,
            "explanation_cn": "莉莉拒绝了钱（It is not my money），说明她诚实、不图回报。reward 意为报酬，honest 意为诚实的。",
            "explanation_en": "Lily refused the money ('It is not my money'), so she was honest and did not want a reward. Note: 'honest' and 'reward' are the key words here."
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
            "question": "This story is ___ than that one.",
            "options": ["interesting", "more interesting", "most interesting", "the most interesting"],
            "answer": 1,
            "explanation_cn": "than 是比较级标志。多音节形容词变比较级加 more：more interesting。注意最高级要加 the most 且不与 than 连用。",
            "explanation_en": "'Than' signals the comparative. Longer adjectives take 'more': more interesting. The superlative 'the most interesting' is not used with 'than'."
          },
          {
            "id": "w3-tue-gr2",
            "type": "fill",
            "question": "Shanghai is one of ___ (big) cities in China. [填入正确形式]",
            "answer": "the biggest",
            "explanation_cn": "one of the + 最高级 + 名词复数 意为最……之一。big 是重读闭音节，双写 g 加 est：the biggest。",
            "explanation_en": "'One of the + superlative + plural noun' means among the most. Note the double g: big → biggest."
          },
          {
            "id": "w3-tue-gr3",
            "type": "fill",
            "question": "I have already ___ (finish) my homework. [填入正确形式]",
            "answer": "finished",
            "explanation_cn": "have already + 过去分词，构成现在完成时。finish 的过去分词是 finished。already 常放在 have/has 后面。",
            "explanation_en": "'Have already + past participle' makes the present perfect. The participle of 'finish' is 'finished'. 'Already' usually goes after 'have/has'."
          },
          {
            "id": "w3-tue-gr4",
            "type": "choice",
            "question": "My uncle ___ in this hospital since 2015.",
            "options": ["works", "has worked", "worked", "is working"],
            "answer": 1,
            "explanation_cn": "since 2015 表示从过去持续到现在，用现在完成时 has worked。主语第三人称单数用 has。注意 since + 时间点，for + 时间段。",
            "explanation_en": "'Since 2015' shows an action from the past until now, so the present perfect 'has worked' is used. Note: 'since' + point of time, 'for' + period."
          },
          {
            "id": "w3-tue-gr5",
            "type": "fill",
            "question": "How long ___ you ___ (learn) English? — For five years. [填入正确形式]",
            "answer": "have learned",
            "explanation_cn": "How long 与现在完成时连用：have learned。for five years 是时间段，和完成时是固定搭配。learn 的过去分词也可以是 learnt。",
            "explanation_en": "'How long' goes with the present perfect: 'have learned'. 'For five years' is a period, which fits the present perfect. 'Learnt' is also a valid participle."
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
            "question": "He is ___ honest boy. Everyone trusts him.",
            "options": ["a", "an", "the", "不填"],
            "answer": 1,
            "explanation_cn": "honest 的 h 不发音，读音以元音 /ɒ/ 开头，所以用 an。这是 KET 常考点：看发音不看字母。",
            "explanation_en": "The 'h' in 'honest' is silent, so the word starts with a vowel sound. Use 'an'. Note: go by the sound, not the letter."
          },
          {
            "id": "w3-tue-mc2",
            "type": "choice",
            "question": "The Yellow River is ___ second longest river in China.",
            "options": ["a", "an", "the", "不填"],
            "answer": 2,
            "explanation_cn": "序数词前面要加 the：the second longest。注意最高级和序数词前都用 the。",
            "explanation_en": "Ordinal numbers take 'the': the second longest. Note: both superlatives and ordinals use 'the'."
          },
          {
            "id": "w3-tue-mc3",
            "type": "choice",
            "question": "Neither of the answers ___ right.",
            "options": ["is", "are", "am", "be"],
            "answer": 0,
            "explanation_cn": "neither of + 名词复数 作主语时，谓语用单数：neither of... is。neither 意为两者都不。",
            "explanation_en": "'Neither of + plural noun' takes a singular verb: 'neither of... is'. Note: 'neither' means not one and not the other."
          },
          {
            "id": "w3-tue-mc4",
            "type": "choice",
            "question": "You'd better ___ too much junk food.",
            "options": ["not eat", "don't eat", "not eating", "not to eat"],
            "answer": 0,
            "explanation_cn": "had better + 动词原形，否定是 had better not + 动词原形。You'd better not eat 意为你最好不要吃。",
            "explanation_en": "'Had better + base verb' is the pattern; the negative is 'had better not + base verb'. So: You'd better not eat."
          },
          {
            "id": "w3-tue-mc5",
            "type": "choice",
            "question": "I want to know ___ she will come tomorrow.",
            "options": ["that", "if", "what", "who"],
            "answer": 1,
            "explanation_cn": "句意是不确定她明天来不来，用 if（是否）引导宾语从句。注意从句要用陈述语序 if she will come。",
            "explanation_en": "The meaning is uncertain, so 'if' (whether) introduces the object clause. Note: the clause keeps statement word order: if she will come."
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周三",
    "day_en": "Wednesday",
    "is_speaking_day": true,
    "total_duration": 40,
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
            "explanation_en": "'You have ever got' is present perfect, so the answer echoes it. A is correct; B is future; C and D do not answer."
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
            "explanation_en": "'It takes somebody + time + to do' is the fixed pattern. A answers with the time; B is not a correct structure; C and D do not answer."
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
            "explanation_en": "'Be going to' expresses a plan. A is correct; B is past; C is unrelated; D does not answer."
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
            "explanation_en": "A names the book directly. B says when you read; C is a metaphor; D only says you bought one."
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
            "explanation_en": "The question asks about a habit, so A ('every day') fits. B is about the parents; C is an opinion; D is happening now, not a habit."
          }
        ]
      },
      {
        "id": "w3-wed-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          vocabWord({
            "word": "museum", "phonetic": "/mjuˈziːəm/", "meaning": "博物馆", "emoji": "🏛️",
            "example_en": "We visited the science museum.", "example_cn": "我们参观了科学博物馆。",
            "syllables": ["mu", "se", "um"], "spell": ["mu__um", "se"],
            "wrongEmoji": ["⭐", "🦕", "🪐"], "wrongMeaning": ["恐龙", "行星", "望远镜"]
          }),
          vocabWord({
            "word": "dinosaur", "phonetic": "/ˈdaɪnəsɔː/", "meaning": "恐龙", "emoji": "🦕",
            "example_en": "Dinosaurs lived long ago.", "example_cn": "恐龙生活在很久以前。",
            "syllables": ["di", "no", "saur"], "spell": ["di__saur", "no"],
            "wrongEmoji": ["⭐", "🏛️", "🚀"], "wrongMeaning": ["博物馆", "火箭", "行星"]
          }),
          vocabWord({
            "word": "planet", "phonetic": "/ˈplænɪt/", "meaning": "行星", "emoji": "🪐",
            "example_en": "The Earth is a planet.", "example_cn": "地球是一颗行星。",
            "syllables": ["plan", "et"], "spell": ["pl__et", "an"],
            "wrongEmoji": ["⭐", "🔭", "🎲"], "wrongMeaning": ["恐龙", "望远镜", "博物馆"]
          }),
          vocabWord({
            "word": "telescope", "phonetic": "/ˈtelɪskəʊp/", "meaning": "望远镜", "emoji": "🔭",
            "example_en": "Look at the stars through the telescope.", "example_cn": "通过望远镜看星星。",
            "syllables": ["te", "le", "scope"], "spell": ["te__scope", "le"],
            "wrongEmoji": ["⭐", "🚀", "🌧️"], "wrongMeaning": ["行星", "火箭", "博物馆"]
          }),
          vocabWord({
            "word": "rocket", "phonetic": "/ˈrɒkɪt/", "meaning": "火箭", "emoji": "🚀",
            "example_en": "The rocket flew into space.", "example_cn": "火箭飞向了太空。",
            "syllables": ["rock", "et"], "spell": ["ro__et", "ck"],
            "wrongEmoji": ["⭐", "🚲", "🦕"], "wrongMeaning": ["望远镜", "行星", "博物馆"]
          })
        ]
      },
      {
        "id": "w3-wed-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 5,
        "passage": "Last month, our class slept overnight in the city science museum. Yes — we took our sleeping bags to a museum! After dark, a guide showed us the stars through a big telescope. I saw Saturn's rings with my own eyes. Then we watched a short film about dinosaurs. At eleven o'clock, we lay down in the hall next to a model rocket. Nobody really wanted to sleep. In the morning, we got a badge that says \"Young Scientist\". It was the most exciting night of the term.",
        "passage_cn": "上个月，我们全班在城市科学博物馆里过夜。没错——我们带着睡袋去了博物馆！天黑后，一位讲解员用大望远镜给我们看星星。我亲眼看到了土星的光环。然后我们看了一部关于恐龙的短片。十一点钟，我们在大厅里一个火箭模型旁躺下。没有人真的想睡。早上，我们得到了写着小小科学家的徽章。这是这学期最激动人心的一夜。",
        "questions": [
          {
            "id": "w3-wed-rd1",
            "type": "choice",
            "question": "Where did the class sleep?",
            "options": [
              "In their school",
              "In the science museum",
              "In a hotel",
              "At the teacher's home"
            ],
            "answer": 1,
            "explanation_cn": "文章第一句说全班在科学博物馆过夜。overnight 意为过夜、一整晚。",
            "explanation_en": "The first sentence says the class slept overnight in the science museum. Note: 'overnight' means for the whole night."
          },
          {
            "id": "w3-wed-rd2",
            "type": "choice",
            "question": "What did the guide show the students?",
            "options": [
              "A film about rockets",
              "The stars through a telescope",
              "A model of Saturn",
              "Dinosaur bones"
            ],
            "answer": 1,
            "explanation_cn": "文章说 a guide showed us the stars through a big telescope。讲解员用望远镜给他们看星星。film 是后来才看的。",
            "explanation_en": "The text says 'a guide showed us the stars through a big telescope.' The film came later."
          },
          {
            "id": "w3-wed-rd3",
            "type": "choice",
            "question": "What did the students get in the morning?",
            "options": [
              "A Young Scientist badge",
              "A model rocket",
              "A book about stars",
              "New sleeping bags"
            ],
            "answer": 0,
            "explanation_cn": "文章说 we got a badge that says Young Scientist。他们得到了小小科学家徽章。badge 意为徽章。",
            "explanation_en": "The text says 'we got a badge that says Young Scientist.' Note: 'badge' means a small pin worn to show something."
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
            "audio_text": "The train to London leaves from Platform Three.",
            "options": [
              "The train to London leaves from Platform Three.",
              "The train to London leaves from Platform Five.",
              "The train to Leeds leaves from Platform Three.",
              "The train to London arrives at Platform Three."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：London（伦敦）、Platform Three（三号站台）。注意 leaves（离开）和 arrives（到达）方向相反；three /θriː/ 和 five /faɪv/ 区分。",
            "explanation_en": "Key words: 'London', 'Platform Three'. Note: 'leaves' and 'arrives' are opposite directions; listen carefully for the verb."
          },
          {
            "id": "w3-thu-ls2",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "Emma has already finished her science project.",
            "options": [
              "Emma has already finished her science project.",
              "Emma has not finished her science project.",
              "Emma has already started her science project.",
              "Emma will finish her science project soon."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：has already finished（已经完成）。注意 already 和 not 意思相反，听清楚有没有 not。",
            "explanation_en": "Key words: 'has already finished'. Note: 'already' and 'not' are opposites — listen for 'not'."
          },
          {
            "id": "w3-thu-ls3",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "There will be a heavy rain tomorrow afternoon.",
            "options": [
              "There will be a heavy rain tomorrow afternoon.",
              "There will be a strong wind tomorrow afternoon.",
              "There was a heavy rain yesterday afternoon.",
              "There will be a light rain tomorrow morning."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：heavy rain（大雨）、tomorrow afternoon（明天下午）。注意 heavy 意为大（量多），和 light（小的）相反。",
            "explanation_en": "Key words: 'heavy rain', 'tomorrow afternoon'. Note: 'heavy' means a lot; 'light' means a little."
          },
          {
            "id": "w3-thu-ls4",
            "type": "fill",
            "question": "听到的数字是什么？",
            "audio_text": "Our school library has more than twelve thousand books.",
            "answer": "12000",
            "explanation_cn": "听力数字：twelve thousand (12000)。注意 thousand 千位的读法：twelve thousand 就是 12 加 thousand。不要和 twelve hundred (1200) 混淆。",
            "explanation_en": "Number: twelve thousand (12,000). Note the pattern: twelve + thousand. Don't confuse it with twelve hundred (1,200)."
          },
          {
            "id": "w3-thu-ls5",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "My cousin has lived in Canada since 2019.",
            "options": [
              "My cousin has lived in Canada since 2019.",
              "My cousin moved to Canada in 2019.",
              "My cousin will live in Canada in 2019.",
              "My uncle has lived in Canada since 2019."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：has lived（一直住在）、since 2019（从2019年起）。注意 cousin 意为表/堂兄弟姐妹，uncle 是叔叔舅舅。since 和完成时连用。",
            "explanation_en": "Key words: 'has lived', 'since 2019'. Note: 'since' + a point of time goes with the present perfect. 'Cousin' is not 'uncle'."
          }
        ]
      },
      {
        "id": "w3-thu-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "Grandpa Wang lives near a small lake. When he was young, the water was so clean that people could 1___ fish in it. Later, a factory was built nearby, and the lake became dirty. Few birds came back any more. Grandpa Wang decided to do something. Every morning, he picked up the rubbish near the lake and told people to 2___ the water. Year after year, he never stopped. Now the lake is clean again. Fish swim here and there, and birds 3___ their nests by the water. \"The lake is like a friend,\" he says. \"You 4___ take care of it, and it will make you 5___.\"",
        "questions": [
          {
            "id": "w3-thu-cz1",
            "type": "choice",
            "question": "1___",
            "options": ["catch", "cook", "sell", "buy"],
            "answer": 0,
            "explanation_cn": "水很干净，人们能在里面钓鱼，用 catch（捕）。catch fish 意为捕鱼。",
            "explanation_en": "The water was so clean that people could 'catch' fish in it. Note: 'catch fish' means to take fish out of the water."
          },
          {
            "id": "w3-thu-cz2",
            "type": "choice",
            "question": "2___",
            "options": ["pollute", "protect", "forget", "cover"],
            "answer": 1,
            "explanation_cn": "爷爷捡垃圾、劝大家保护湖水，用 protect（保护）。pollute 意为污染，意思相反。",
            "explanation_en": "Grandpa Wang asked people to 'protect' the water. Note: 'pollute' means to make dirty — the opposite of what he wanted."
          },
          {
            "id": "w3-thu-cz3",
            "type": "choice",
            "question": "3___",
            "options": ["build", "break", "lose", "find"],
            "answer": 0,
            "explanation_cn": "鸟在湖边筑巢，用 build their nests。build nests 意为筑巢。",
            "explanation_en": "Birds 'build' their nests by the water. Note: 'build a nest' means to make a nest."
          },
          {
            "id": "w3-thu-cz4",
            "type": "choice",
            "question": "4___",
            "options": ["must", "needn't", "never", "hardly"],
            "answer": 0,
            "explanation_cn": "湖像朋友，你必须照顾它，用 must（必须）。needn't 意为不必，意思不对。",
            "explanation_en": "'The lake is like a friend. You must take care of it.' Note: 'must' means have to."
          },
          {
            "id": "w3-thu-cz5",
            "type": "choice",
            "question": "5___",
            "options": ["happy", "sad", "angry", "tired"],
            "answer": 0,
            "explanation_cn": "你照顾它，它让你开心，用 happy。make sb happy 意为让某人开心。",
            "explanation_en": "Take care of it, and it will make you 'happy'. Note: 'make somebody happy' means to bring joy to someone."
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
            "question": "They ___ (know) each other for ten years. [填入正确形式]",
            "answer": "have known",
            "explanation_cn": "for ten years 是时间段，用现在完成时。know 的过去分词是 known（know-knew-known），是不规则变化。",
            "explanation_en": "'For ten years' is a period, so the present perfect is used. 'Know' is irregular: know-knew-known."
          },
          {
            "id": "w3-thu-tn2",
            "type": "fill",
            "question": "I ___ (read) this book twice already. [填入正确形式]",
            "answer": "have read",
            "explanation_cn": "already 和 twice 表示到目前为止的经历，用现在完成时 have read。注意 read 的过去分词拼写不变，读音变：/red/。",
            "explanation_en": "'Already' and 'twice' show experience up to now, so the present perfect 'have read' is used. Note: the participle 'read' is spelled the same but pronounced /red/."
          },
          {
            "id": "w3-thu-tn3",
            "type": "choice",
            "question": "While I ___ dinner, the phone rang.",
            "options": ["cook", "cooked", "was cooking", "am cooking"],
            "answer": 2,
            "explanation_cn": "while 引导的从句表示过去正在进行的动作，用过去进行时 was cooking。主句 the phone rang 是一般过去时。",
            "explanation_en": "'While' introduces an ongoing past action, so the past continuous 'was cooking' is used. The main clause uses the simple past 'rang'."
          },
          {
            "id": "w3-thu-tn4",
            "type": "choice",
            "question": "Look at the black clouds! It ___ rain.",
            "options": ["is going to", "was going to", "goes to", "went to"],
            "answer": 0,
            "explanation_cn": "乌云密布说明马上要下雨，有迹象的将来用 be going to。look 提示是现在，所以 is going to rain。",
            "explanation_en": "Black clouds are a sign, so 'be going to' is used for the near future: 'is going to rain'."
          },
          {
            "id": "w3-thu-tn5",
            "type": "choice",
            "question": "— ___ you ever ___ to Beijing? — Yes, twice.",
            "options": ["Did; go", "Have; been", "Have; gone", "Do; go"],
            "answer": 1,
            "explanation_cn": "ever（曾经）和 twice 是经历，用现在完成时 Have you ever been to...? 注意 have been to 去过（已回来），have gone to 去了（还没回来）。",
            "explanation_en": "'Ever' and 'twice' ask about experience, so the present perfect is used: 'Have you ever been to...?' Note: 'have been to' means went and came back; 'have gone to' means went and is still there."
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周五",
    "day_en": "Friday",
    "is_speaking_day": false,
    "total_duration": 30,
    "theme_cn": "模板写作 + KET/PET题型 + 语法复习",
    "modules": [
      {
        "id": "w3-fri-writing",
        "name_cn": "写作练习",
        "type": "writing_template",
        "duration": 15,
        "title": "My Weekend Plan",
        "requirement_cn": "请根据关键词提示完成作文，完成后请背诵全文。明天将进行挖空默写测试！",
        "keywords": [
          "this weekend",
          "visit the park",
          "fly kites",
          "eat sandwiches",
          "exciting"
        ],
        "keywords_cn": [
          "这周末",
          "去公园",
          "放风筝",
          "吃三明治",
          "令人兴奋的"
        ],
        "template": "{{1}} I am going to {{2}} with my family. We will {{3}} on the grass. Then we are going to {{4}} together. What an {{5}} day it will be!",
        "blanks": [
          { "id": 1, "hint_cn": "这周末", "hint_en": "this weekend", "answer": "this weekend" },
          { "id": 2, "hint_cn": "去公园", "hint_en": "visit the park", "answer": "visit the park" },
          { "id": 3, "hint_cn": "放风筝", "hint_en": "fly kites", "answer": "fly kites" },
          { "id": 4, "hint_cn": "吃三明治", "hint_en": "eat sandwiches", "answer": "eat sandwiches" },
          { "id": 5, "hint_cn": "令人兴奋的", "hint_en": "exciting", "answer": "exciting" }
        ],
        "full_text": "This weekend I am going to visit the park with my family. We will fly kites on the grass. Then we are going to eat sandwiches together. What an exciting day it will be!",
        "full_text_cn": "这周末我要和家人去公园。我们要在草地上放风筝。然后我们一起吃三明治。那将是多么令人兴奋的一天啊！",
        "explanation_cn": "这篇作文围绕周末计划展开，使用了5个关键词。注意：1) this weekend 放句首作时间状语；2) be going to + 动词原形表示计划；3) will + 动词原形表示将来；4) fly kites 放风筝；5) What an + 形容词 + 名词 是感叹句，exciting 修饰事物。整篇用一般将来时。",
        "explanation_en": "This essay is about a weekend plan, using 5 keywords. Notes: 1) 'this weekend' at the start as a time adverbial; 2) 'be going to + base verb' for plans; 3) 'will + base verb' for the future; 4) 'fly kites'; 5) 'What an + adjective + noun' is the exclamation pattern; 'exciting' describes things. The essay uses the simple future tense."
      },
      {
        "id": "w3-fri-ket",
        "name_cn": "KET/PET题型",
        "type": "ket_pet",
        "duration": 10,
        "questions": [
          {
            "id": "w3-fri-kp1",
            "type": "choice",
            "question": "KET: Choose the correct answer. I have lived in this town ___ I was born.",
            "options": ["since", "for", "when", "from"],
            "answer": 0,
            "explanation_cn": "since + 过去的时间点（I was born 是一个时间点），和现在完成时连用。for 后面接时间段，比如 for ten years。",
            "explanation_en": "'Since' + a point of time goes with the present perfect. 'For' takes a period, like 'for ten years'."
          },
          {
            "id": "w3-fri-kp2",
            "type": "choice",
            "question": "KET: Choose the correct answer. — Must I finish the homework today? — No, you ___. You can do it tomorrow.",
            "options": ["mustn't", "needn't", "can't", "shouldn't"],
            "answer": 1,
            "explanation_cn": "Must I...? 的否定回答用 needn't（不必）。mustn't 意为禁止，语气完全不同。这是 KET 高频考点。",
            "explanation_en": "The negative answer to 'Must I...?' is 'needn't' (no need). 'Mustn't' means it is forbidden — a completely different meaning. A common KET trap."
          },
          {
            "id": "w3-fri-kp3",
            "type": "choice",
            "question": "KET: Choose the correct answer. She is good ___ maths.",
            "options": ["at", "in", "on", "for"],
            "answer": 0,
            "explanation_cn": "be good at + 学科/事情 意为擅长。固定搭配：be good at maths。注意 be good for 意为对……有好处。",
            "explanation_en": "'Be good at + subject/skill' means to be skilled at it. Note: 'be good for' means to be healthy or useful for."
          },
          {
            "id": "w3-fri-kp4",
            "type": "fill",
            "question": "PET: Complete the second sentence so that it means the same as the first. 'This bike is too expensive for me to buy.' = This bike isn't ___ for me to buy.",
            "answer": "cheap enough",
            "explanation_cn": "PET 句型转换。too...to（太……而不能）可换成 not...enough to（不够……而不能）。too expensive = not cheap enough。注意 enough 放在形容词后面。",
            "explanation_en": "PET transformation. 'Too...to' can be rewritten as 'not...enough to'. too expensive = not cheap enough. Note: 'enough' comes after the adjective."
          },
          {
            "id": "w3-fri-kp5",
            "type": "choice",
            "question": "KET: Choose the correct answer. There ___ a football match on TV tonight.",
            "options": ["is going to be", "are going to be", "is going to have", "will have"],
            "answer": 0,
            "explanation_cn": "There be 句型的将来时：There is going to be / There will be。a football match 是单数，用 is。注意 there be 句型不能说 there will have。",
            "explanation_en": "The future of 'there be' is 'There is going to be / There will be'. 'A football match' is singular, so 'is'. Note: never say 'there will have'."
          }
        ]
      },
      {
        "id": "w3-fri-grammar",
        "name_cn": "语法复习",
        "type": "grammar",
        "duration": 5,
        "questions": [
          {
            "id": "w3-fri-gr1",
            "type": "choice",
            "question": "Tom as well as his friends ___ playing football now.",
            "options": ["is", "are", "am", "be"],
            "answer": 0,
            "explanation_cn": "as well as 连接主语时，谓语和最前面的主语一致。主语是 Tom（单数），所以用 is。",
            "explanation_en": "With 'as well as', the verb agrees with the first subject. The subject is 'Tom' (singular), so 'is'."
          },
          {
            "id": "w3-fri-gr2",
            "type": "choice",
            "question": "The film ___ by the time we got to the cinema.",
            "options": ["already began", "had already begun", "has already begun", "begins"],
            "answer": 1,
            "explanation_cn": "by the time + 过去时，主句用过去完成时 had begun。表示到过去某个时间点之前已经发生。",
            "explanation_en": "'By the time + past clause' takes the past perfect in the main clause: 'had already begun'."
          },
          {
            "id": "w3-fri-gr3",
            "type": "fill",
            "question": "Jim runs ___ (fast) than any other boy in his class. [填入正确形式]",
            "answer": "faster",
            "explanation_cn": "than 是比较级标志。fast 的比较级是 faster。than any other boy 意为比班里其他任何男孩都快。",
            "explanation_en": "'Than' signals the comparative: fast → faster. 'Than any other boy' means faster than all the others."
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周六",
    "day_en": "Saturday",
    "is_speaking_day": true,
    "total_duration": 40,
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
            "explanation_en": "'Last Sunday' is past time, so the past form 'helped' is used. B is a present habit; C is future; D changes the subject."
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
            "explanation_en": "'What kind' asks for a type. A answers with a type (cartoons); B talks about one film; C is about the time; D is about popcorn."
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
            "explanation_en": "'How often' asks about frequency, so answer with how many times: 'three times a week'. Note: once, twice, then 'times'."
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
            "explanation_en": "A names the place directly. B is about where you live; C describes the city; D does not name a place."
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
            "explanation_en": "Answer 'Do you like...?' with 'Yes, I do' plus a reason. B only gives a past fact; C and D do not answer."
          }
        ]
      },
      {
        "id": "w3-sat-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          vocabWord({
            "word": "beach", "phonetic": "/biːtʃ/", "meaning": "沙滩", "emoji": "🏖️",
            "example_en": "We played on the beach all day.", "example_cn": "我们一整天都在沙滩上玩。",
            "syllables": ["beach"], "spell": ["be__h", "ac"],
            "wrongEmoji": ["⭐", "🐬", "⛰️"], "wrongMeaning": ["海浪", "海豚", "阳光"]
          }),
          vocabWord({
            "word": "wave", "phonetic": "/weɪv/", "meaning": "海浪", "emoji": "🌊",
            "example_en": "The waves are big today.", "example_cn": "今天海浪很大。",
            "syllables": ["wave"], "spell": ["w__e", "av"],
            "wrongEmoji": ["⭐", "🚗", "🎲"], "wrongMeaning": ["沙滩", "海豚", "沙堡"]
          }),
          vocabWord({
            "word": "sandcastle", "phonetic": "/ˈsændkɑːsl/", "meaning": "沙堡", "emoji": "🏰",
            "example_en": "The children built a sandcastle.", "example_cn": "孩子们堆了一座沙堡。",
            "syllables": ["sand", "cas", "tle"], "spell": ["sandcas__e", "tl"],
            "wrongEmoji": ["⭐", "🌧️", "🏀"], "wrongMeaning": ["沙滩", "阳光", "海浪"]
          }),
          vocabWord({
            "word": "sunshine", "phonetic": "/ˈsʌnʃaɪn/", "meaning": "阳光", "emoji": "☀️",
            "example_en": "We sat in the warm sunshine.", "example_cn": "我们坐在温暖的阳光里。",
            "syllables": ["sun", "shine"], "spell": ["sun__ine", "sh"],
            "wrongEmoji": ["⭐", "☂️", "🚲"], "wrongMeaning": ["沙堡", "沙滩", "海豚"]
          }),
          vocabWord({
            "word": "dolphin", "phonetic": "/ˈdɒlfɪn/", "meaning": "海豚", "emoji": "🐬",
            "example_en": "A dolphin jumped out of the water.", "example_cn": "一只海豚跳出了水面。",
            "syllables": ["dol", "phin"], "spell": ["do__hin", "lp"],
            "wrongEmoji": ["⭐", "🎸", "☂️"], "wrongMeaning": ["阳光", "海浪", "沙堡"]
          })
        ]
      },
      {
        "id": "w3-sat-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 5,
        "passage": "During the summer holidays, Kate's family took a boat trip along the coast. The sea was calm and the sunshine was warm. Suddenly, Kate saw something jump out of the water. \"Dolphins!\" she shouted. Three dolphins swam next to the boat for ten minutes. They jumped and played like children. The captain stopped the boat so everyone could watch. Kate took many photos with her camera. \"This is the best day of my holiday,\" she said. On the way home, she decided to learn more about sea animals.",
        "passage_cn": "暑假里，凯特一家沿着海岸坐船游玩。海面平静，阳光温暖。突然，凯特看见有什么东西跃出水面。海豚！她喊道。三只海豚在船边游了十分钟。它们像孩子一样又跳又玩。船长停船让大家观看。凯特用相机拍了很多照片。这是假期里最好的一天，她说。回家的路上，她决定多了解海洋动物。",
        "questions": [
          {
            "id": "w3-sat-rd1",
            "type": "choice",
            "question": "What did Kate see in the water?",
            "options": ["Three sharks", "Three dolphins", "Three whales", "Three boats"],
            "answer": 1,
            "explanation_cn": "文章说 Three dolphins swam next to the boat。三只海豚在船边游。dolphin 意为海豚。",
            "explanation_en": "The text says 'Three dolphins swam next to the boat.' Note: 'dolphin' means a clever sea animal that jumps."
          },
          {
            "id": "w3-sat-rd2",
            "type": "choice",
            "question": "Why did the captain stop the boat?",
            "options": [
              "Because the sea was dangerous",
              "Because everyone wanted to watch the dolphins",
              "Because the boat was broken",
              "Because it was time for lunch"
            ],
            "answer": 1,
            "explanation_cn": "文章说 The captain stopped the boat so everyone could watch。船长停船是为了让大家观看海豚。captain 意为船长。",
            "explanation_en": "The text says 'The captain stopped the boat so everyone could watch.' Note: 'captain' means the leader of the boat."
          },
          {
            "id": "w3-sat-rd3",
            "type": "choice",
            "question": "What did Kate decide to do after the trip?",
            "options": [
              "To buy a bigger boat",
              "To take photos every day",
              "To learn more about sea animals",
              "To swim with dolphins"
            ],
            "answer": 2,
            "explanation_cn": "文章最后说 she decided to learn more about sea animals。她决定多了解海洋动物。decide to do 意为决定做某事。",
            "explanation_en": "The last line says 'she decided to learn more about sea animals.' Note: 'decide to do' means to make a choice to do something."
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
        "id": "w3-sun-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "Mike is only ten, but he is already the best chess player in his school. He learned chess from his grandfather when he was six. Now he practises for an hour every evening. Last month, Mike took part in a city competition. There were more than fifty players, and most of them were older than him. Mike lost his second game and felt nervous. But he calmed down and won the next four games. In the end, he finished third and got a bronze medal. \"Losing is not the end,\" Mike says. \"It teaches me where I am weak.\"",
        "passage_cn": "迈克只有十岁，却已经是他学校里最好的棋手。他六岁时跟爷爷学会了下棋。现在他每天晚上练习一小时。上个月，迈克参加了市里的比赛。参赛的有五十多名选手，大多数比他年纪大。迈克输了第二局，感到紧张。但他冷静下来，赢了接下来的四局。最后他获得第三名，拿到一枚铜牌。输了不是终点，迈克说，它让我知道自己哪里弱。",
        "questions": [
          {
            "id": "w3-sun-rd1",
            "type": "choice",
            "question": "Who taught Mike to play chess?",
            "options": ["His father", "His grandfather", "His teacher", "A city coach"],
            "answer": 1,
            "explanation_cn": "文章说 He learned chess from his grandfather when he was six。爷爷教的。learn from 意为向……学习。",
            "explanation_en": "The text says 'He learned chess from his grandfather when he was six.' Note: 'learn from somebody' means somebody taught you."
          },
          {
            "id": "w3-sun-rd2",
            "type": "choice",
            "question": "How many players took part in the competition?",
            "options": ["More than fifteen", "More than fifty", "Less than fifteen", "Exactly fifty"],
            "answer": 1,
            "explanation_cn": "文章说 There were more than fifty players。有五十多名选手。注意 fifty（50）和 fifteen（15）重音位置不同。",
            "explanation_en": "The text says 'There were more than fifty players.' Note: fifty /ˈfɪfti/ and fifteen /ˌfɪfˈtiːn/ differ in stress."
          },
          {
            "id": "w3-sun-rd3",
            "type": "choice",
            "question": "What did Mike learn from losing?",
            "options": [
              "Chess is too hard for him.",
              "He should stop playing chess.",
              "It shows him where he is weak.",
              "Older players always win."
            ],
            "answer": 2,
            "explanation_cn": "Mike 说 Losing is not the end. It teaches me where I am weak。失败让他知道自己哪里弱。weak 意为弱的、不足的。",
            "explanation_en": "Mike says losing 'teaches me where I am weak'. Note: 'weak' means not strong — here, a weak point in his play."
          }
        ]
      },
      {
        "id": "w3-sun-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          vocabWord({
            "word": "competition", "phonetic": "/ˌkɒmpəˈtɪʃn/", "meaning": "比赛；竞赛", "emoji": "🏅",
            "example_en": "He took part in a chess competition.", "example_cn": "他参加了象棋比赛。",
            "syllables": ["com", "pe", "ti", "tion"], "spell": ["competi__on", "ti"],
            "wrongEmoji": ["⭐", "😰", "🥇"], "wrongMeaning": ["紧张的", "奖牌", "练习"]
          }),
          vocabWord({
            "word": "nervous", "phonetic": "/ˈnɜːvəs/", "meaning": "紧张的", "emoji": "😰",
            "example_en": "I felt nervous before the test.", "example_cn": "考试前我很紧张。",
            "syllables": ["ner", "vous"], "spell": ["ner__ous", "v"],
            "wrongEmoji": ["⭐", "🏅", "🎲"], "wrongMeaning": ["比赛", "奖牌", "青铜的"]
          }),
          vocabWord({
            "word": "medal", "phonetic": "/ˈmedl/", "meaning": "奖牌", "emoji": "🥇",
            "example_en": "She won a gold medal.", "example_cn": "她赢得了一枚金牌。",
            "syllables": ["me", "dal"], "spell": ["me__l", "da"],
            "wrongEmoji": ["⭐", "🚗", "🌧️"], "wrongMeaning": ["比赛", "紧张的", "练习"]
          }),
          vocabWord({
            "word": "bronze", "phonetic": "/brɒnz/", "meaning": "青铜；铜牌", "emoji": "🥉",
            "example_en": "He got a bronze medal.", "example_cn": "他获得了一枚铜牌。",
            "syllables": ["bronze"], "spell": ["br__ze", "on"],
            "wrongEmoji": ["⭐", "🥇", "🎸"], "wrongMeaning": ["奖牌", "比赛", "练习"]
          }),
          vocabWord({
            "word": "practise", "phonetic": "/ˈpræktɪs/", "meaning": "练习", "emoji": "🖊️",
            "example_en": "Practice makes perfect.", "example_cn": "熟能生巧。",
            "syllables": ["prac", "tise"], "spell": ["pra__ise", "ct"],
            "wrongEmoji": ["⭐", "🥉", "☂️"], "wrongMeaning": ["铜牌", "紧张的", "奖牌"]
          })
        ]
      },
      {
        "id": "w3-sun-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "Anna and Rita have been friends since Grade One. One day, there was a maths 1___ at school. Anna got the highest mark, but Rita failed. Rita felt sad and stopped 2___ to Anna. Anna didn't get angry. She made a beautiful card for Rita. On it she wrote, \"You helped me when I was 3___. Now let me help you.\" Every day after school, Anna taught Rita maths for an hour. A month later, Rita passed the 4___ test. \"Thank you for not giving up on 5___,\" Rita said with tears in her eyes.",
        "questions": [
          {
            "id": "w3-sun-cz1",
            "type": "choice",
            "question": "1___",
            "options": ["test", "race", "party", "game"],
            "answer": 0,
            "explanation_cn": "后面说分数（mark），说明是考试，用 test。a maths test 意为数学考试。",
            "explanation_en": "Marks are mentioned later, so it was a maths 'test'. Note: 'mark' means a score."
          },
          {
            "id": "w3-sun-cz2",
            "type": "choice",
            "question": "2___",
            "options": ["talking", "listening", "coming", "running"],
            "answer": 0,
            "explanation_cn": "丽塔难过，不再和安娜说话，用 stopped talking to。stop doing 意为停止做某事。",
            "explanation_en": "Rita was sad and stopped 'talking' to Anna. Note: 'stop doing' means to not do it any more."
          },
          {
            "id": "w3-sun-cz3",
            "type": "choice",
            "question": "3___",
            "options": ["tall", "sick", "strong", "rich"],
            "answer": 1,
            "explanation_cn": "你在我生病时帮助过我，用 sick。when I was sick 意为当我生病的时候。",
            "explanation_en": "'You helped me when I was sick.' Note: 'sick' means ill."
          },
          {
            "id": "w3-sun-cz4",
            "type": "choice",
            "question": "4___",
            "options": ["first", "next", "last", "only"],
            "answer": 1,
            "explanation_cn": "一个月后丽塔通过了下一次考试，用 next test（下一次考试）。",
            "explanation_en": "A month later Rita passed the 'next' test. Note: 'next' means the one that comes after."
          },
          {
            "id": "w3-sun-cz5",
            "type": "choice",
            "question": "5___",
            "options": ["her", "me", "him", "them"],
            "answer": 1,
            "explanation_cn": "丽塔在说话，谢谢安娜没有放弃我，用 me。give up on sb 意为对某人不抱希望、放弃某人。",
            "explanation_en": "Rita is speaking, so she thanks Anna for not giving up on 'me'. Note: 'give up on somebody' means to stop believing in them."
          }
        ]
      }
    ]
  }
];


// ===== 第 4 周（B1 · KET 冲刺 / PET 衔接）：被动语态 / 过去完成 / 科学与文明 =====
const WEEK4 = [
  {
    "day_cn": "周一",
    "day_en": "Monday",
    "is_speaking_day": true,
    "total_duration": 40,
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
            "explanation_en": "For an imagined future, use the second conditional: 'If I won..., I would...'. The if-clause uses the past form and the main clause uses 'would + base verb'. B mixes the tenses wrongly."
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
            "explanation_en": "The question asks for an opinion, so give a view with a reason. A does ('neat' means tidy); B says what you are wearing now; C and D do not answer."
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
            "explanation_en": "A answers with the superlative 'the most useful'; B talks about making something yourself; C and D do not answer."
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
            "explanation_en": "'How' asks for a way or method. A gives concrete actions (sorting rubbish, saving water); B is an opinion; C and D do not answer."
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
            "explanation_en": "A names the subject and adds progress; B misunderstands 'find' (here it means to think something is hard, not to locate); C and D do not answer."
          }
        ]
      },
      {
        "id": "w4-mon-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          vocabWord({
            "word": "invent", "phonetic": "/ɪnˈvent/", "meaning": "发明", "emoji": "💡",
            "example_en": "Who invented the telephone?", "example_cn": "谁发明了电话？",
            "syllables": ["in", "vent"], "spell": ["in__nt", "ve"],
            "wrongEmoji": ["⭐", "🔬", "♻️"], "wrongMeaning": ["实验", "回收利用", "污染"]
          }),
          vocabWord({
            "word": "experiment", "phonetic": "/ɪkˈsperɪmənt/", "meaning": "实验", "emoji": "🔬",
            "example_en": "We did an experiment in class.", "example_cn": "我们在课堂上做了一个实验。",
            "syllables": ["ex", "pe", "ri", "ment"], "spell": ["expe__ment", "ri"],
            "wrongEmoji": ["⭐", "💡", "⚡"], "wrongMeaning": ["发明", "能量", "回收利用"]
          }),
          vocabWord({
            "word": "recycle", "phonetic": "/ˌriːˈsaɪkl/", "meaning": "回收利用", "emoji": "♻️",
            "example_en": "Please recycle the plastic bottles.", "example_cn": "请回收塑料瓶。",
            "syllables": ["re", "cy", "cle"], "spell": ["rec__cle", "y"],
            "wrongEmoji": ["⭐", "🏭", "🎲"], "wrongMeaning": ["污染", "实验", "发明"]
          }),
          vocabWord({
            "word": "pollution", "phonetic": "/pəˈluːʃn/", "meaning": "污染", "emoji": "🏭",
            "example_en": "Air pollution is bad for our health.", "example_cn": "空气污染有害健康。",
            "syllables": ["po", "llu", "tion"], "spell": ["pol__tion", "lu"],
            "wrongEmoji": ["⭐", "🔬", "☂️"], "wrongMeaning": ["回收利用", "实验", "能量"]
          }),
          vocabWord({
            "word": "energy", "phonetic": "/ˈenədʒi/", "meaning": "能量；能源", "emoji": "⚡",
            "example_en": "The sun gives us energy.", "example_cn": "太阳给我们能量。",
            "syllables": ["en", "er", "gy"], "spell": ["en__gy", "er"],
            "wrongEmoji": ["⭐", "💡", "🎸"], "wrongMeaning": ["发明", "污染", "实验"]
          })
        ]
      },
      {
        "id": "w4-mon-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 5,
        "passage": "Last year, the students of Greenfield Middle School started a special project. They noticed that people in their town threw away plastic bottles every day. The students set up bottle bins around the streets and made posters about recycling. At first, only a few people used the bins. The students didn't give up. They visited the local radio station and talked about their project on air. Soon more and more people joined in. After six months, the town had collected over two million bottles. The money from recycling was used to build a small library for the school. \"Children can change the world too,\" the mayor said when she opened the library.",
        "passage_cn": "去年，绿田中学的学生们启动了一个特别的项目。他们注意到镇上的人每天扔掉塑料瓶。学生们在街头设置了瓶子回收箱，还制作了关于回收利用的海报。起初只有少数人使用回收箱，但学生们没有放弃。他们去了本地广播电台，在节目里介绍他们的项目。很快越来越多的人加入了。六个月后，全镇收集了超过两百万个瓶子。回收换来的钱被用来给学校建了一座小图书馆。市长在图书馆启用时说：孩子们也能改变世界。",
        "questions": [
          {
            "id": "w4-mon-rd1",
            "type": "choice",
            "question": "What did the students set up around the streets?",
            "options": ["Plastic factories", "Bottle bins", "Small libraries", "Radio stations"],
            "answer": 1,
            "explanation_cn": "文章说 The students set up bottle bins around the streets。学生们设置的是瓶子回收箱。set up 意为设立、建立。",
            "explanation_en": "The text says 'The students set up bottle bins around the streets.' Note: 'set up' means to establish or place."
          },
          {
            "id": "w4-mon-rd2",
            "type": "choice",
            "question": "How did more people learn about the project?",
            "options": [
              "From the students' posters on TV",
              "From the radio programme",
              "From the mayor's letter",
              "From a book about recycling"
            ],
            "answer": 1,
            "explanation_cn": "文章说 They visited the local radio station and talked about their project on air。他们通过广播节目让更多人知道。on air 意为在广播中。",
            "explanation_en": "The text says they talked about the project 'on air' at the local radio station. Note: 'on air' means being broadcast."
          },
          {
            "id": "w4-mon-rd3",
            "type": "choice",
            "question": "What was the recycling money used for?",
            "options": [
              "Buying more bottle bins",
              "Making new posters",
              "Building a small library",
              "Paying the students"
            ],
            "answer": 2,
            "explanation_cn": "文章说 The money from recycling was used to build a small library。钱被用来建小图书馆。注意这是被动语态：was used to do。",
            "explanation_en": "The text says 'The money from recycling was used to build a small library.' Note the passive voice: was used to do."
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
        "passage": "Do you know how tea travelled around the world? Tea was first grown in China thousands of years ago. At that time, it was used as a medicine. Later, people began to drink it for pleasure. In the seventeenth century, ships carried tea from China to Europe. It quickly became popular in England. Tea houses opened in big cities, and drinking tea became an important part of daily life. Today, millions of cups of tea are drunk around the world every day. In England, people often add milk to their tea. In China, many people drink it plain. Different countries, different habits — but the same little leaf.",
        "passage_cn": "你知道茶叶是如何传遍世界的吗？茶最早种植于几千年前的中国。那时它被当作药用。后来人们开始把它当作饮品享用。十七世纪，商船把茶叶从中国运到欧洲。它在英格兰迅速流行起来。大城市里茶馆开张，喝茶成为日常生活的重要部分。如今全世界每天要喝掉数百万杯茶。在英格兰，人们常往茶里加牛奶；在中国，很多人喝清茶。国家不同，习惯不同——但都是同一种小小的叶子。",
        "questions": [
          {
            "id": "w4-tue-rd1",
            "type": "choice",
            "question": "What was tea first used as?",
            "options": ["A drink", "A medicine", "A gift", "Money"],
            "answer": 1,
            "explanation_cn": "文章说 At that time, it was used as a medicine。茶最早被当作药用。注意这是被动语态：was used as。",
            "explanation_en": "The text says 'At that time, it was used as a medicine.' Note the passive voice: was used as."
          },
          {
            "id": "w4-tue-rd2",
            "type": "choice",
            "question": "Who carried tea to Europe in the seventeenth century?",
            "options": ["English farmers", "Chinese students", "Ships from China", "European doctors"],
            "answer": 2,
            "explanation_cn": "文章说 ships carried tea from China to Europe。是船把茶运到欧洲的。seventeenth century 意为十七世纪。",
            "explanation_en": "The text says 'ships carried tea from China to Europe.' Note: 'century' means a hundred years."
          },
          {
            "id": "w4-tue-rd3",
            "type": "choice",
            "question": "How do many people in China drink their tea?",
            "options": ["With milk", "With sugar", "Plain", "Cold with ice"],
            "answer": 2,
            "explanation_cn": "文章说 In China, many people drink it plain。中国人喝清茶。plain 这里意为不加东西的、清的。",
            "explanation_en": "The text says 'In China, many people drink it plain.' Note: 'plain' here means without adding anything."
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
            "question": "English ___ by millions of people around the world.",
            "options": ["speaks", "is spoken", "spoke", "is speaking"],
            "answer": 1,
            "explanation_cn": "English 和 speak 是被动关系（英语被说），用被动语态 is spoken。被动结构：be + 过去分词。",
            "explanation_en": "'English' receives the action, so the passive voice is used: 'is spoken'. Structure: be + past participle."
          },
          {
            "id": "w4-tue-gr2",
            "type": "fill",
            "question": "The classroom ___ (clean) every day. [填入正确形式]",
            "answer": "is cleaned",
            "explanation_cn": "教室是被打扫的，用被动语态 is cleaned。every day 是一般现在时标志，所以用 is + 过去分词。",
            "explanation_en": "The classroom is cleaned by someone, so the passive is used. 'Every day' signals the simple present: is + cleaned."
          },
          {
            "id": "w4-tue-gr3",
            "type": "choice",
            "question": "The photos ___ on the Great Wall last summer.",
            "options": ["took", "were taken", "was taken", "take"],
            "answer": 1,
            "explanation_cn": "photos 是被拍的，用被动语态。photos 是复数，所以用 were taken。注意主谓数的一致。",
            "explanation_en": "The photos were taken by someone, and 'photos' is plural, so 'were taken' is correct. Watch the subject-verb agreement."
          },
          {
            "id": "w4-tue-gr4",
            "type": "fill",
            "question": "Paper ___ (invent) in China. [填入正确形式]",
            "answer": "was invented",
            "explanation_cn": "纸是被发明的，且发生在过去，用一般过去时的被动：was invented。四大发明之一的说法：Paper was invented in China.",
            "explanation_en": "Paper was invented in the past by someone, so the past passive 'was invented' is used."
          },
          {
            "id": "w4-tue-gr5",
            "type": "choice",
            "question": "A new school ___ in our town next year.",
            "options": ["will build", "will be built", "is built", "was built"],
            "answer": 1,
            "explanation_cn": "next year 是将来，学校是被建的，用将来时被动：will be built。结构 will + be + 过去分词。",
            "explanation_en": "'Next year' is future and the school is built by someone, so the future passive is used: 'will be built'. Structure: will + be + past participle."
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
            "question": "If it ___ tomorrow, we will stay at home.",
            "options": ["rains", "will rain", "rained", "would rain"],
            "answer": 0,
            "explanation_cn": "主将从现：主句用将来（will stay），if 从句用一般现在时（rains）。这是 KET/PET 高频考点。",
            "explanation_en": "'If' clause for a real future possibility uses the present tense, while the main clause uses 'will': If it rains, we will stay. A key exam point."
          },
          {
            "id": "w4-tue-mc2",
            "type": "choice",
            "question": "This is the boy ___ won the first prize.",
            "options": ["which", "who", "whose", "whom"],
            "answer": 1,
            "explanation_cn": "先行词是 the boy（人），且在从句中作主语（won 的主语），用 who。which 指物；whom 作宾语；whose 表所属。",
            "explanation_en": "The antecedent is a person doing the action, so 'who' is used. 'Which' is for things; 'whom' is an object; 'whose' shows possession."
          },
          {
            "id": "w4-tue-mc3",
            "type": "choice",
            "question": "He asked me ___ I could help him with his English.",
            "options": ["that", "what", "if", "who"],
            "answer": 2,
            "explanation_cn": "ask 后接一般疑问句内容的宾语从句用 if/whether（是否）。从句用陈述语序：if I could help。",
            "explanation_en": "After 'ask', a yes/no question becomes a clause with 'if/whether'. Statement word order: 'if I could help'."
          },
          {
            "id": "w4-tue-mc4",
            "type": "choice",
            "question": "Not only my parents but also my sister ___ the film.",
            "options": ["like", "likes", "liking", "liked"],
            "answer": 1,
            "explanation_cn": "not only...but also... 连接主语时遵循就近原则，谓语和最近的主语 my sister 一致，用单数 likes。注意时态是一般现在时。",
            "explanation_en": "With 'not only... but also...', the verb agrees with the nearest subject: 'my sister' (singular), so 'likes'."
          },
          {
            "id": "w4-tue-mc5",
            "type": "choice",
            "question": "It is ___ useful book that I have read it twice.",
            "options": ["such a", "so a", "such", "so"],
            "answer": 0,
            "explanation_cn": "such + a + 形容词 + 名词：such a useful book。so 后面直接跟形容词：so useful a book。注意 useful 是辅音音素开头，用 a 不用 an。",
            "explanation_en": "The pattern is 'such + a + adjective + noun': such a useful book. With 'so', the order changes: so useful a book. Note: 'useful' starts with a consonant sound /j/, so 'a'."
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周三",
    "day_en": "Wednesday",
    "is_speaking_day": true,
    "total_duration": 40,
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
            "explanation_en": "'Would like to + base verb' means to want to do. A is correct; B wrongly uses the past form after 'to'; C and D do not answer."
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
            "explanation_en": "A names the person and gives the reason ('never gives up'); B uses a wrong pattern after 'admire'; C is just a fact; D does not answer."
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
            "explanation_en": "'What do you do' asks for actions. A gives two concrete habits; B states a fact about yourself; C is an opinion; D is about mother."
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
            "explanation_en": "An imagined situation with 'could' is answered with 'would'. A is correct and adds a reason; B wrongly uses 'will'; C and D do not answer."
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
            "explanation_en": "A answers with the best trip experience; B is future; C is an opinion; D describes a daily commute, not a trip."
          }
        ]
      },
      {
        "id": "w4-wed-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          vocabWord({
            "word": "soldier", "phonetic": "/ˈsəʊldʒə/", "meaning": "士兵", "emoji": "🪖",
            "example_en": "The soldiers stood on the wall.", "example_cn": "士兵们站在城墙上。",
            "syllables": ["sol", "dier"], "spell": ["sol__er", "di"],
            "wrongEmoji": ["⭐", "🏯", "🧵"], "wrongMeaning": ["宫殿", "丝绸", "贸易"]
          }),
          vocabWord({
            "word": "palace", "phonetic": "/ˈpæləs/", "meaning": "宫殿", "emoji": "🏯",
            "example_en": "The palace has a long history.", "example_cn": "这座宫殿历史悠久。",
            "syllables": ["pal", "ace"], "spell": ["pal__e", "ac"],
            "wrongEmoji": ["⭐", "🪖", "🚢"], "wrongMeaning": ["士兵", "奇迹", "贸易"]
          }),
          vocabWord({
            "word": "silk", "phonetic": "/sɪlk/", "meaning": "丝绸", "emoji": "🧵",
            "example_en": "This scarf is made of silk.", "example_cn": "这条围巾是丝绸做的。",
            "syllables": ["silk"], "spell": ["s__lk", "i"],
            "wrongEmoji": ["⭐", "🚗", "🗻"], "wrongMeaning": ["宫殿", "贸易", "士兵"]
          }),
          vocabWord({
            "word": "trade", "phonetic": "/treɪd/", "meaning": "贸易；买卖", "emoji": "🚢",
            "example_en": "Ships carried goods for trade.", "example_cn": "轮船运送货物做贸易。",
            "syllables": ["trade"], "spell": ["tr__e", "ad"],
            "wrongEmoji": ["⭐", "🧵", "☂️"], "wrongMeaning": ["丝绸", "宫殿", "奇迹"]
          }),
          vocabWord({
            "word": "wonder", "phonetic": "/ˈwʌndə/", "meaning": "奇迹；奇观", "emoji": "🗿",
            "example_en": "The Great Wall is a wonder of the world.", "example_cn": "长城是世界奇迹之一。",
            "syllables": ["won", "der"], "spell": ["wo__er", "nd"],
            "wrongEmoji": ["⭐", "🚢", "🎲"], "wrongMeaning": ["贸易", "丝绸", "宫殿"]
          })
        ]
      },
      {
        "id": "w4-wed-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 5,
        "passage": "The Great Wall is one of the greatest wonders of the world. It winds like a giant dragon across the mountains of northern China. The wall was first built more than two thousand years ago. Different states built walls to protect their land. Later, they were joined together. The wall that we see today was mostly built in the Ming Dynasty. In the past, soldiers stood on the wall and watched for enemies. Beacons were lit to send messages quickly over long distances. Today, the wall is no longer used for war. Millions of visitors climb it every year and enjoy the amazing views. As an old saying goes, \"He who has never been to the Great Wall is not a true man.\"",
        "passage_cn": "长城是世界上最伟大的奇迹之一。它像一条巨龙蜿蜒穿过中国北方的群山。长城最早建于两千多年前。不同的诸侯国修筑城墙来保护自己的土地，后来这些城墙被连接起来。我们今天看到的长城大部分建于明代。过去，士兵们站在城墙上瞭望敌情，点燃烽火台把消息快速传到远方。如今，长城不再用于战争。每年数百万游客登上长城，欣赏壮丽的景色。正如古语所说：不到长城非好汉。",
        "questions": [
          {
            "id": "w4-wed-rd1",
            "type": "choice",
            "question": "Why were the first walls built?",
            "options": [
              "To welcome visitors",
              "To protect the land",
              "To watch the stars",
              "To send letters"
            ],
            "answer": 1,
            "explanation_cn": "文章说 Different states built walls to protect their land。修墙是为了保护土地。注意文中用被动语态 was first built。",
            "explanation_en": "The text says 'Different states built walls to protect their land.' Note the passive form 'was first built' earlier in the sentence."
          },
          {
            "id": "w4-wed-rd2",
            "type": "choice",
            "question": "When was most of today's wall built?",
            "options": [
              "Two thousand years ago",
              "In the seventeenth century",
              "In the Ming Dynasty",
              "Last century"
            ],
            "answer": 2,
            "explanation_cn": "文章说 The wall that we see today was mostly built in the Ming Dynasty。今天的长城大部分建于明代。Ming Dynasty 意为明朝。",
            "explanation_en": "The text says 'The wall that we see today was mostly built in the Ming Dynasty.' Note: 'Dynasty' means a period ruled by one family."
          },
          {
            "id": "w4-wed-rd3",
            "type": "choice",
            "question": "How were messages sent quickly in the past?",
            "options": [
              "By birds",
              "By lighting beacons",
              "By horses at night",
              "By drums on the wall"
            ],
            "answer": 1,
            "explanation_cn": "文章说 Beacons were lit to send messages quickly over long distances。点燃烽火传讯。beacon 意为烽火、信号灯。",
            "explanation_en": "The text says 'Beacons were lit to send messages quickly over long distances.' Note: 'beacon' means a fire or light used as a signal."
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
            "audio_text": "The concert has been put off until next Friday because of the storm.",
            "options": [
              "The concert has been put off until next Friday because of the storm.",
              "The concert has been put on until next Friday because of the storm.",
              "The concert was cancelled because of the rain.",
              "The concert will start earlier because of the storm."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：has been put off（被推迟）。put off 意为推迟，put on 意为上演。because of 后面接名词或名词短语。",
            "explanation_en": "Key phrase: 'has been put off' (postponed). Note: 'put off' means to delay, 'put on' means to stage a show. 'Because of' is followed by a noun phrase."
          },
          {
            "id": "w4-thu-ls2",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "More than three hundred students joined the reading club this year.",
            "options": [
              "More than three hundred students joined the reading club this year.",
              "More than thirteen students joined the reading club this year.",
              "More than three hundred students joined the singing club this year.",
              "Three students joined the reading club last year."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：three hundred（300）、reading club（阅读社）。注意 hundred /ˈhʌndrəd/ 和 thirteen /ˌfɜːˈtiːn/ 数字差别大，抓住重音。",
            "explanation_en": "Key words: 'three hundred', 'reading club'. Note the stress difference between 'hundred' and 'thirteen'."
          },
          {
            "id": "w4-thu-ls3",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "You'd better take an umbrella with you when you go out.",
            "options": [
              "You'd better take an umbrella with you when you go out.",
              "You'd better take off your umbrella when you go out.",
              "You'd better bring a raincoat with you when you go out.",
              "You must buy an umbrella before you go out."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：You'd better（你最好）、take an umbrella（带伞）。注意 take an umbrella 和 take off（脱下）意思相反。",
            "explanation_en": "Key phrases: 'You'd better', 'take an umbrella'. Note: 'take off' means to remove — the opposite action here."
          },
          {
            "id": "w4-thu-ls4",
            "type": "fill",
            "question": "听到的数字是什么？",
            "audio_text": "The Great Wall is about twenty-one thousand kilometres long.",
            "answer": "21000",
            "explanation_cn": "听力数字：twenty-one thousand (21000)。注意 twenty-one（21）加 thousand（千），合起来是两万一千。kilometre 意为千米。",
            "explanation_en": "Number: twenty-one thousand (21,000). Note: twenty-one + thousand. 'Kilometre' means one thousand metres."
          },
          {
            "id": "w4-thu-ls5",
            "type": "choice",
            "question": "听到的句子是什么？",
            "audio_text": "Mr Green has taught at this school for twenty years.",
            "options": [
              "Mr Green has taught at this school for twenty years.",
              "Mr Green taught at this school twenty years ago.",
              "Mr Green has learned at this school for twenty years.",
              "Mr Green will teach at this school for twenty years."
            ],
            "answer": 0,
            "explanation_cn": "听力关键词：has taught（一直教）、for twenty years（二十年）。for + 时间段和现在完成时连用。注意 taught /tɔːt/ 是 teach 的过去分词。",
            "explanation_en": "Key words: 'has taught', 'for twenty years'. 'For' + period goes with the present perfect. 'Taught' is the participle of 'teach'."
          }
        ]
      },
      {
        "id": "w4-thu-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "When Jack was eight, his grandfather's legs became weak, and he could not 1___ up the stairs easily. Jack wanted to help. He watched, drew pictures and tried again and again. A year later, he invented a small 2___ that carries things up and down the stairs. His grandfather was very 3___. Now the little machine is used in many homes in Jack's town. Last month, Jack 4___ a prize at a national invention competition. \"Don't wait until you grow up,\" Jack tells other children. \"If you see a 5___, try to solve it.\"",
        "questions": [
          {
            "id": "w4-thu-cz1",
            "type": "choice",
            "question": "1___",
            "options": ["walk", "run", "jump", "look"],
            "answer": 0,
            "explanation_cn": "腿脚不便，上楼困难，用 walk up the stairs（走上楼梯）。run 和 jump 与腿脚不便矛盾。",
            "explanation_en": "His legs were weak, so he could not 'walk' up the stairs easily. 'Run' and 'jump' contradict weak legs."
          },
          {
            "id": "w4-thu-cz2",
            "type": "choice",
            "question": "2___",
            "options": ["bicycle", "machine", "phone", "computer"],
            "answer": 1,
            "explanation_cn": "后文说 the little machine，所以发明的是小机器，用 machine。machine 意为机器。",
            "explanation_en": "The text later says 'the little machine', so he invented a 'machine'."
          },
          {
            "id": "w4-thu-cz3",
            "type": "choice",
            "question": "3___",
            "options": ["proud", "sorry", "worried", "afraid"],
            "answer": 0,
            "explanation_cn": "孙子发明了帮他的机器，爷爷非常自豪，用 proud。be proud 意为感到自豪。",
            "explanation_en": "His grandson invented a machine to help him, so he was very 'proud'. Note: 'proud' means pleased about something done well."
          },
          {
            "id": "w4-thu-cz4",
            "type": "choice",
            "question": "4___",
            "options": ["lost", "won", "missed", "gave"],
            "answer": 1,
            "explanation_cn": "在全国发明比赛中获奖，用 won a prize。win-won-won，win a prize 意为获奖。",
            "explanation_en": "He got a prize at the competition, so he 'won' a prize. Note: win-won-won."
          },
          {
            "id": "w4-thu-cz5",
            "type": "choice",
            "question": "5___",
            "options": ["problem", "dream", "game", "toy"],
            "answer": 0,
            "explanation_cn": "看到问题就试着解决它，用 problem。solve a problem 意为解决问题，是固定搭配。",
            "explanation_en": "'If you see a problem, try to solve it.' Note: 'solve a problem' is a fixed collocation."
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
            "question": "The bridge ___ (build) in 1937. [填入正确形式]",
            "answer": "was built",
            "explanation_cn": "桥是被建的，且 1937 是过去时间，用一般过去时的被动：was built。build-built-built。",
            "explanation_en": "The bridge was built by people in the past, so the past passive 'was built' is used. Note: build-built-built."
          },
          {
            "id": "w4-thu-tn2",
            "type": "choice",
            "question": "By the time we arrived, the film ___ for ten minutes.",
            "options": ["began", "had begun", "has begun", "was beginning"],
            "answer": 1,
            "explanation_cn": "by the time + 过去时，主句用过去完成时 had begun。电影开始发生在到达之前，是过去的过去。",
            "explanation_en": "'By the time + past' takes the past perfect: 'had begun'. The film started before they arrived — the past of the past."
          },
          {
            "id": "w4-thu-tn3",
            "type": "fill",
            "question": "If it ___ (be) sunny tomorrow, we will climb the mountain. [填入正确形式]",
            "answer": "is",
            "explanation_cn": "主将从现：主句用 will climb，if 从句用一般现在时。主语 it 用 is。",
            "explanation_en": "The main clause uses 'will climb', so the if-clause uses the simple present: 'is'."
          },
          {
            "id": "w4-thu-tn4",
            "type": "choice",
            "question": "He ___ his keys, so he couldn't open the door.",
            "options": ["lost", "has lost", "had lost", "loses"],
            "answer": 2,
            "explanation_cn": "丢钥匙发生在打不开门之前，是过去的过去，用过去完成时 had lost。注意结果 couldn't open 是一般过去时。",
            "explanation_en": "Losing the keys happened before he couldn't open the door — the past of the past — so 'had lost' is used."
          },
          {
            "id": "w4-thu-tn5",
            "type": "fill",
            "question": "I ___ (not see) her since she moved to Shanghai. [填入正确形式]",
            "answer": "haven't seen",
            "explanation_cn": "since 引导从她搬家到现在，用现在完成时否定式 haven't seen。since 从句用过去式 moved。",
            "explanation_en": "'Since she moved' connects the past to now, so the present perfect negative 'haven't seen' is used."
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周五",
    "day_en": "Friday",
    "is_speaking_day": false,
    "total_duration": 30,
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
          { "id": 1, "hint_cn": "一个地球", "hint_en": "one earth", "answer": "one earth" },
          { "id": 2, "hint_cn": "垃圾分类", "hint_en": "sort the rubbish", "answer": "sort the rubbish" },
          { "id": 3, "hint_cn": "节约用水", "hint_en": "save water", "answer": "save water" },
          { "id": 4, "hint_cn": "植树", "hint_en": "plant trees", "answer": "plant trees" },
          { "id": 5, "hint_cn": "更好的地方", "hint_en": "better place", "answer": "better place" }
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
            "options": ["where", "which", "when", "whose"],
            "answer": 1,
            "explanation_cn": "定语从句。visit 是及物动词，缺宾语，先行词是物（museum），用 which/that。where 只能作状语（visited there 就不缺宾语了）。",
            "explanation_en": "Relative clause: 'visited' is missing an object, and the antecedent is a thing, so 'which/that' is used. 'Where' would leave 'visited' without an object."
          },
          {
            "id": "w4-fri-kp2",
            "type": "choice",
            "question": "PET: Choose the correct answer. I ___ getting up early because I run every morning.",
            "options": ["am used to", "used to", "was used to", "use to"],
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
            "options": ["how", "what", "which", "why"],
            "answer": 0,
            "explanation_cn": "deal with（处理）的搭配是 how to deal with。what 常和 do with 搭配：what to do with。这两个搭配不要混。",
            "explanation_en": "'Deal with' goes with 'how': how to deal with. 'Do with' goes with 'what'. Don't mix the two pairs."
          },
          {
            "id": "w4-fri-kp5",
            "type": "choice",
            "question": "PET: Choose the correct answer. By the end of last year, they ___ five thousand trees.",
            "options": ["planted", "had planted", "have planted", "will plant"],
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
        "duration": 5,
        "questions": [
          {
            "id": "w4-fri-gr1",
            "type": "fill",
            "question": "The window ___ (break) by the naughty boy yesterday. [填入正确形式]",
            "answer": "was broken",
            "explanation_cn": "窗户是被打破的，by 引出动作执行者，用被动语态 was broken。break-broke-broken。",
            "explanation_en": "The window was broken by the boy ('by' shows who did it), so the passive 'was broken' is used. Note: break-broke-broken."
          },
          {
            "id": "w4-fri-gr2",
            "type": "choice",
            "question": "I remember ___ the door when I left, but it was open when I came back.",
            "options": ["lock", "locking", "to lock", "locked"],
            "answer": 1,
            "explanation_cn": "remember doing 意为记得做过某事（已做）；remember to do 意为记得要去做（还没做）。这里记得锁过门，用 locking。",
            "explanation_en": "'Remember doing' means you remember an action you already did; 'remember to do' means remember to do it later. Here the locking already happened: 'locking'."
          },
          {
            "id": "w4-fri-gr3",
            "type": "fill",
            "question": "Neither of the twins ___ (be) good at singing. [填入正确形式]",
            "answer": "is",
            "explanation_cn": "neither of + 复数名词作主语，谓语用单数：is。neither 意为两者都不。",
            "explanation_en": "'Neither of + plural noun' takes a singular verb: 'is'. Note: 'neither' means not either of the two."
          }
        ]
      }
    ]
  },
  {
    "day_cn": "周六",
    "day_en": "Saturday",
    "is_speaking_day": true,
    "total_duration": 40,
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
            "explanation_en": "The imagined advice uses 'would': A is correct. B should also use 'would'; C reports the past, not advice; D just describes."
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
            "explanation_en": "The question asks to choose between two things. A chooses books and gives a reason; B answers with a third thing; C and D do not answer."
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
            "explanation_en": "A answers with the superlative directly ('the most important thing'); B only gives a duration; C is off topic; D gives an example but A matches the question best."
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
            "explanation_en": "'How' asks for a way. A gives two concrete actions; B, C and D are statements that do not answer."
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
            "explanation_en": "The imagined 'could' question is answered with 'would'. A is correct with a reason; B is a real plan; C is a past fact; D does not answer."
          }
        ]
      },
      {
        "id": "w4-sat-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          vocabWord({
            "word": "pyramid", "phonetic": "/ˈpɪrəmɪd/", "meaning": "金字塔", "emoji": "🔺",
            "example_en": "The pyramids are in Egypt.", "example_cn": "金字塔在埃及。",
            "syllables": ["pyr", "a", "mid"], "spell": ["py__mid", "ra"],
            "wrongEmoji": ["⭐", "🐪", "❓"], "wrongMeaning": ["骆驼", "沙漠", "之谜"]
          }),
          vocabWord({
            "word": "desert", "phonetic": "/ˈdezət/", "meaning": "沙漠", "emoji": "🐪",
            "example_en": "Camels live in the desert.", "example_cn": "骆驼生活在沙漠里。",
            "syllables": ["des", "ert"], "spell": ["des__t", "er"],
            "wrongEmoji": ["⭐", "🔺", "🧭"], "wrongMeaning": ["金字塔", "之谜", "导游"]
          }),
          vocabWord({
            "word": "camel", "phonetic": "/ˈkæml/", "meaning": "骆驼", "emoji": "🐫",
            "example_en": "The camel is called the ship of the desert.", "example_cn": "骆驼被称为沙漠之舟。",
            "syllables": ["cam", "el"], "spell": ["cam__l", "e"],
            "wrongEmoji": ["⭐", "🏜️", "☂️"], "wrongMeaning": ["沙漠", "金字塔", "导游"]
          }),
          vocabWord({
            "word": "mystery", "phonetic": "/ˈmɪstri/", "meaning": "谜；神秘的事物", "emoji": "❓",
            "example_en": "The old house is full of mystery.", "example_cn": "那座老房子充满神秘。",
            "syllables": ["mys", "te", "ry"], "spell": ["mys__ry", "te"],
            "wrongEmoji": ["⭐", "🚢", "🎲"], "wrongMeaning": ["导游", "沙漠", "骆驼"]
          }),
          vocabWord({
            "word": "guide", "phonetic": "/ɡaɪd/", "meaning": "导游；指南", "emoji": "🧭",
            "example_en": "The guide showed us around the city.", "example_cn": "导游带我们游览了这座城市。",
            "syllables": ["guide"], "spell": ["g__de", "ui"],
            "wrongEmoji": ["⭐", "❓", "🎸"], "wrongMeaning": ["之谜", "骆驼", "沙漠"]
          })
        ]
      },
      {
        "id": "w4-sat-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 5,
        "passage": "Last year, Tom took part in a charity run across part of the Gobi Desert. Before the race, he trained for six months. Runners had to carry their own food and water for three days. On the second day, Tom's water ran out, and the sun was burning. Another runner, an old man, shared his water with Tom. \"We are not rivals,\" the man said. \"We are friends in the desert.\" In the end, Tom finished forty-first out of two hundred runners, but he raised ten thousand yuan for sick children. He says the medal that matters is not made of gold.",
        "passage_cn": "去年，汤姆参加了一场穿越戈壁滩部分的慈善跑。赛前他训练了六个月。参赛者要自己带三天的食物和水。第二天，汤姆的水喝完了，太阳火辣辣的。另一位选手——一位老先生，把自己的水分给了汤姆。我们不是对手，老先生说，我们是沙漠里的朋友。最后，汤姆在两百名选手中名列第四十一，但他为患病儿童筹到了一万元。他说，真正重要的奖牌不是金子做的。",
        "questions": [
          {
            "id": "w4-sat-rd1",
            "type": "choice",
            "question": "How long did Tom train before the race?",
            "options": ["For three days", "For six months", "For two weeks", "For a year"],
            "answer": 1,
            "explanation_cn": "文章说 Before the race, he trained for six months。赛前训练了六个月。train 意为训练。",
            "explanation_en": "The text says 'Before the race, he trained for six months.' Note: 'train' means to practise for a race."
          },
          {
            "id": "w4-sat-rd2",
            "type": "choice",
            "question": "Who shared water with Tom?",
            "options": ["The judge of the race", "A young runner", "An old runner", "A doctor"],
            "answer": 2,
            "explanation_cn": "文章说 Another runner, an old man, shared his water with Tom。一位老选手分了水。share sth with sb 意为和某人分享某物。",
            "explanation_en": "The text says 'Another runner, an old man, shared his water with Tom.' Note: 'share something with somebody'."
          },
          {
            "id": "w4-sat-rd3",
            "type": "choice",
            "question": "What does Tom mean by \"the medal that matters is not made of gold\"?",
            "options": [
              "He wants a gold medal next time.",
              "Helping others is more important than winning.",
              "The medal he got was made of silver.",
              "Gold medals are too expensive."
            ],
            "answer": 1,
            "explanation_cn": "他名次不高但为患病儿童筹到了钱，说明他认为帮助别人才是真正重要的。matter 意为要紧、重要。",
            "explanation_en": "He did not win but raised money for sick children, so he means helping others matters more than winning. Note: 'matter' means to be important."
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
        "id": "w4-sun-reading",
        "name_cn": "阅读理解",
        "type": "reading",
        "duration": 10,
        "passage": "Helen Keller was born in America in 1880. When she was nineteen months old, a terrible illness took away her sight and hearing. Little Helen lived in a dark and silent world. She could not see or hear, so it was very hard for her to learn words. When Helen was almost seven, a teacher called Anne Sullivan came to live with her family. Anne spelled words into Helen's hand. One day, water ran over Helen's hand while Anne spelled w-a-t-e-r. Suddenly, Helen understood. From then on, she learned quickly. She even learned to speak and went to university. Helen wrote books and travelled around the world, helping blind people everywhere.",
        "passage_cn": "海伦·凯勒 1880 年出生于美国。她十九个月大时，一场可怕的疾病夺走了她的视力和听力。小海伦生活在一个黑暗又寂静的世界里。她看不见也听不见，学词语对她来说非常困难。海伦快七岁时，一位叫安妮·沙利文的老师来到她家和她一起生活。安妮在海伦手心里拼单词。有一天，水流过海伦的手，安妮同时拼出 w-a-t-e-r。海伦突然懂了。从那以后，她学得飞快。她甚至学会了说话，还上了大学。海伦写了书，走遍世界，帮助各地的盲人。",
        "questions": [
          {
            "id": "w4-sun-rd1",
            "type": "choice",
            "question": "What happened to Helen when she was nineteen months old?",
            "options": [
              "She moved to America.",
              "An illness took away her sight and hearing.",
              "She met her teacher Anne.",
              "She went to university."
            ],
            "answer": 1,
            "explanation_cn": "文章说 a terrible illness took away her sight and hearing。疾病夺走了她的视力和听力。sight 意为视力，hearing 意为听力。",
            "explanation_en": "The text says 'a terrible illness took away her sight and hearing.' Note: 'sight' means the ability to see, 'hearing' the ability to hear."
          },
          {
            "id": "w4-sun-rd2",
            "type": "choice",
            "question": "Who was Anne Sullivan?",
            "options": ["Helen's mother", "Helen's doctor", "Helen's teacher", "Helen's classmate"],
            "answer": 2,
            "explanation_cn": "文章说 a teacher called Anne Sullivan came to live with her family。安妮是海伦的老师。called 意为名叫。",
            "explanation_en": "The text says 'a teacher called Anne Sullivan'. Note: 'called' here means named."
          },
          {
            "id": "w4-sun-rd3",
            "type": "choice",
            "question": "What did Helen do later in her life?",
            "options": [
              "She wrote books and helped blind people.",
              "She became a teacher for deaf children.",
              "She stopped learning after university.",
              "She travelled only in America."
            ],
            "answer": 0,
            "explanation_cn": "文章最后说 Helen wrote books and travelled around the world, helping blind people everywhere。她写书并帮助全世界的盲人。blind 意为失明的。",
            "explanation_en": "The last lines say 'Helen wrote books and travelled around the world, helping blind people everywhere.' Note: 'blind' means unable to see."
          }
        ]
      },
      {
        "id": "w4-sun-vocab",
        "name_cn": "高频词汇",
        "type": "vocabulary_game",
        "duration": 5,
        "words": [
          vocabWord({
            "word": "sight", "phonetic": "/saɪt/", "meaning": "视力", "emoji": "👁️",
            "example_en": "The illness took away her sight.", "example_cn": "疾病夺走了她的视力。",
            "syllables": ["sight"], "spell": ["s__ht", "ig"],
            "wrongEmoji": ["⭐", "🤫", "🤒"], "wrongMeaning": ["安静的", "疾病", "勇气"]
          }),
          vocabWord({
            "word": "silent", "phonetic": "/ˈsaɪlənt/", "meaning": "寂静的；沉默的", "emoji": "🤫",
            "example_en": "The room was silent.", "example_cn": "房间里一片寂静。",
            "syllables": ["si", "lent"], "spell": ["si__nt", "le"],
            "wrongEmoji": ["⭐", "🎓", "🎲"], "wrongMeaning": ["大学", "视力", "疾病"]
          }),
          vocabWord({
            "word": "courage", "phonetic": "/ˈkʌrɪdʒ/", "meaning": "勇气", "emoji": "🦁",
            "example_en": "She had the courage to try again.", "example_cn": "她有勇气再试一次。",
            "syllables": ["cour", "age"], "spell": ["cou__ge", "ra"],
            "wrongEmoji": ["⭐", "👁️", "☂️"], "wrongMeaning": ["视力", "寂静的", "大学"]
          }),
          vocabWord({
            "word": "university", "phonetic": "/ˌjuːnɪˈvɜːsəti/", "meaning": "大学", "emoji": "🎓",
            "example_en": "She went to university at eighteen.", "example_cn": "她十八岁上了大学。",
            "syllables": ["u", "ni", "ver", "si", "ty"], "spell": ["univer__ty", "si"],
            "wrongEmoji": ["⭐", "🤫", "🚗"], "wrongMeaning": ["勇气", "寂静的", "疾病"]
          }),
          vocabWord({
            "word": "disease", "phonetic": "/dɪˈziːz/", "meaning": "疾病", "emoji": "🤒",
            "example_en": "Washing hands helps stop disease.", "example_cn": "洗手有助于预防疾病。",
            "syllables": ["di", "ease"], "spell": ["dis__se", "ea"],
            "wrongEmoji": ["⭐", "🎓", "🦁"], "wrongMeaning": ["大学", "视力", "勇气"]
          })
        ]
      },
      {
        "id": "w4-sun-cloze",
        "name_cn": "完形填空",
        "type": "cloze",
        "duration": 10,
        "passage": "Leo promised his classmate Ben to return a comic book on Monday morning. But on Sunday night, a heavy rain 1___ and Leo got a high fever. His mother told him to stay in bed. Leo was worried, not because he was ill, but because he couldn't 2___ his promise. Early on Monday, he asked his father to take him to school for just one minute. He 3___ the comic book to Ben at the school gate and went home again. When Ben heard the whole story, he was deeply moved. True friends 4___ their promises. From that day on, the two boys became best friends, and their classmates learned the 5___ of keeping a promise.",
        "questions": [
          {
            "id": "w4-sun-cz1",
            "type": "choice",
            "question": "1___",
            "options": ["stopped", "started", "ended", "passed"],
            "answer": 1,
            "explanation_cn": "暴雨下起来了，用 started。a heavy rain started 意为暴雨开始下。",
            "explanation_en": "The heavy rain 'started' on Sunday night. Note: 'started' means began."
          },
          {
            "id": "w4-sun-cz2",
            "type": "choice",
            "question": "2___",
            "options": ["break", "forget", "keep", "lose"],
            "answer": 2,
            "explanation_cn": "他担心的不是生病，而是没法遵守承诺，用 keep his promise。keep a promise 意为遵守承诺。",
            "explanation_en": "He worried that he couldn't 'keep' his promise. Note: 'keep a promise' means to do what you promised."
          },
          {
            "id": "w4-sun-cz3",
            "type": "choice",
            "question": "3___",
            "options": ["sold", "threw", "handed", "lent"],
            "answer": 2,
            "explanation_cn": "他在校门口把漫画书交给了本，用 handed。hand sth to sb 意为把某物递给某人。",
            "explanation_en": "He 'handed' the comic book to Ben at the gate. Note: 'hand something to somebody' means to pass it over."
          },
          {
            "id": "w4-sun-cz4",
            "type": "choice",
            "question": "4___",
            "options": ["make", "keep", "tell", "take"],
            "answer": 1,
            "explanation_cn": "真正的朋友遵守承诺，用 keep their promises。make a promise 意为许下承诺，keep a promise 意为遵守承诺。",
            "explanation_en": "True friends 'keep' their promises. Note: you 'make' a promise first, then 'keep' it."
          },
          {
            "id": "w4-sun-cz5",
            "type": "choice",
            "question": "5___",
            "options": ["fun", "importance", "trouble", "joke"],
            "answer": 1,
            "explanation_cn": "同学们学到了遵守承诺的重要性，用 importance。the importance of doing 意为做某事的重要性。",
            "explanation_en": "The classmates learned the 'importance' of keeping a promise. Note: 'the importance of doing something'."
          }
        ]
      }
    ]
  }
];


const HOMEWORK_WEEKS = [WEEK1, WEEK2, WEEK3, WEEK4];

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
const HOMEWORK_DATA = HOMEWORK_WEEKS[HOMEWORK_WEEK_IDX];
