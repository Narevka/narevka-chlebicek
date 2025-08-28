-- Create agents table
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  openai_assistant_id TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  source TEXT,
  content TEXT,
  confidence REAL,
  has_thumbs_up BOOLEAN DEFAULT false,
  has_thumbs_down BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_bot BOOLEAN DEFAULT false,
  confidence REAL,
  has_thumbs_up BOOLEAN DEFAULT false,
  has_thumbs_down BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_sources table
CREATE TABLE public.agent_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  chars INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_sources ENABLE ROW LEVEL SECURITY;

-- Create policies for agents
CREATE POLICY "Users can view their own agents" 
ON public.agents 
FOR SELECT 
USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create their own agents" 
ON public.agents 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own agents" 
ON public.agents 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own agents" 
ON public.agents 
FOR DELETE 
USING (user_id = auth.uid());

-- Create policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations" 
ON public.conversations 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own conversations" 
ON public.conversations 
FOR DELETE 
USING (user_id = auth.uid());

-- Create policies for messages
CREATE POLICY "Users can view messages from their conversations" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update messages in their conversations" 
ON public.messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages from their conversations" 
ON public.messages 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

-- Create policies for agent_sources
CREATE POLICY "Users can view their own agent sources" 
ON public.agent_sources 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own agent sources" 
ON public.agent_sources 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own agent sources" 
ON public.agent_sources 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own agent sources" 
ON public.agent_sources 
FOR DELETE 
USING (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_sources_updated_at
  BEFORE UPDATE ON public.agent_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_conversations_agent_id ON public.conversations(agent_id);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_agent_sources_agent_id ON public.agent_sources(agent_id);
CREATE INDEX idx_agent_sources_user_id ON public.agent_sources(user_id);