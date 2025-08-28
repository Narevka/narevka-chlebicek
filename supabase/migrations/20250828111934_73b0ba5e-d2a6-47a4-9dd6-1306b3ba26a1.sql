-- Update RLS policies for conversations to allow embedded chats
-- First drop existing policies
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;

-- Create new policies that allow both authenticated users and embedded chats
CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (
  (user_id = auth.uid()) OR 
  (user_id IS NULL AND source = 'embedded')
);

CREATE POLICY "Users can view conversations" 
ON public.conversations 
FOR SELECT 
USING (
  (user_id = auth.uid()) OR 
  (user_id IS NULL AND source = 'embedded')
);

CREATE POLICY "Users can update conversations" 
ON public.conversations 
FOR UPDATE 
USING (
  (user_id = auth.uid()) OR 
  (user_id IS NULL AND source = 'embedded')
);

CREATE POLICY "Users can delete conversations" 
ON public.conversations 
FOR DELETE 
USING (user_id = auth.uid());