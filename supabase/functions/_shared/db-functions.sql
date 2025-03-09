
-- Function to get spider jobs for an agent
CREATE OR REPLACE FUNCTION get_spider_jobs(agent_id_param UUID)
RETURNS SETOF spider_jobs AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM spider_jobs
  WHERE agent_id = agent_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a spider job
CREATE OR REPLACE FUNCTION delete_spider_job(job_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM spider_jobs
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a spider job status
CREATE OR REPLACE FUNCTION update_spider_job_status(url_param TEXT, agent_id_param UUID, status_param TEXT, count_param INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE spider_jobs
  SET 
    status = status_param,
    result_count = count_param,
    updated_at = now()
  WHERE 
    url = url_param AND 
    agent_id = agent_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
