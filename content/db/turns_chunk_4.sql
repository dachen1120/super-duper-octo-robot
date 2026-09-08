insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, NULL, 16, 'B', 'Fair enough. Any other cool stories?', '说得有道理。还有其他酷新闻吗？', '[{"word": "fair enough", "pos": "phrase", "meaning": "有道理；说得过去"}, {"word": "other", "pos": "adj.", "meaning": "其他的"}, {"word": "cool", "pos": "adj.", "meaning": "很棒的；酷的（口语）"}, {"word": "story", "pos": "n.", "meaning": "新闻；报道"}]'::jsonb, '{"title": "省略问句 Any other…?", "body": "Any other cool stories? 是 Are there any other cool stories? 的口语省略，用于转换话题。"}'::jsonb, 'audio/turns/t-0016.mp3', 76584, 81048);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 5, 17, 'A', 'Lenovo just showed a laptop that runs huge AI models locally.', '联想刚展示了一台能在本地运行大模型的笔记本。', '[{"word": "Lenovo", "pos": "n.", "meaning": "联想（公司名）"}, {"word": "just", "pos": "adv.", "meaning": "刚刚"}, {"word": "show", "pos": "v.", "meaning": "展示"}, {"word": "laptop", "pos": "n.", "meaning": "笔记本电脑"}, {"word": "run", "pos": "v.", "meaning": "运行"}, {"word": "huge", "pos": "adj.", "meaning": "巨大的"}, {"word": "model", "pos": "n.", "meaning": "模型"}, {"word": "locally", "pos": "adv.", "meaning": "在本地（设备端）"}]'::jsonb, '{"title": "定语从句 that runs…", "body": "that runs huge AI models locally 作定语从句修饰 a laptop；just + 过去式表“刚刚”。"}'::jsonb, 'audio/turns/t-0017.mp3', 81848, 86792);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 5, 18, 'B', 'That''s insane. How big are those models?', '太夸张了。那些模型有多大？', '[{"word": "insane", "pos": "adj.", "meaning": "疯狂的；太夸张了（口语）"}, {"word": "big", "pos": "adj.", "meaning": "大的"}, {"word": "model", "pos": "n.", "meaning": "模型"}]'::jsonb, '{"title": "感叹 + How 疑问句", "body": "That''s insane. 表惊讶感叹；How big are those models? 用 How + 形容词对“大小”提问。"}'::jsonb, 'audio/turns/t-0018.mp3', 87212, 91820);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 5, 19, 'A', 'Up to 120 billion parameters, running on Nvidia''s RTX Spark chip.', '高达 1200 亿参数，跑在英伟达 RTX Spark 芯片上。', '[{"word": "up to", "pos": "phrase", "meaning": "高达；最多"}, {"word": "billion", "pos": "num.", "meaning": "十亿"}, {"word": "parameter", "pos": "n.", "meaning": "参数"}, {"word": "chip", "pos": "n.", "meaning": "芯片"}]'::jsonb, '{"title": "无动词省略句", "body": "本句省略谓语，是口语省略；up to + 数字表上限；running on… 现在分词作补充说明。"}'::jsonb, 'audio/turns/t-0019.mp3', 92240, 98432);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 5, 20, 'B', 'No cloud needed? Everything runs on the device?', '不需要云端？全在设备上运行？', '[{"word": "cloud", "pos": "n.", "meaning": "云端（云计算）"}, {"word": "needed", "pos": "adj.", "meaning": "需要的"}, {"word": "everything", "pos": "pron.", "meaning": "一切"}, {"word": "device", "pos": "n.", "meaning": "设备"}]'::jsonb, '{"title": "省略句 No cloud needed", "body": "No cloud needed 是 No cloud is needed 的省略；一般现在时 runs 表设备具备的能力。"}'::jsonb, 'audio/turns/t-0020.mp3', 98852, 103724);