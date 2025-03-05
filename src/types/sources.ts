
export interface SourceItem {
  id: string;
  agent_id: string;
  user_id: string;
  type: string;
  content: string;
  chars: number;
  created_at: string;
}

export interface SourceStats {
  filesSources: SourceItem[];
  textSources: SourceItem[];
  websiteSources: SourceItem[];
  qaSources: SourceItem[];
  fileChars: number;
  textChars: number;
  websiteChars: number;
  qaChars: number;
  totalChars: number;
}
