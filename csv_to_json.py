
# coding: utf-8

# In[2]:


import pandas as pd
df = pd.read_csv("C:\\Users\\67315\\Desktop\\project_metamap\\tree_data.csv")
df.to_json('C:\\Users\\67315\\Desktop\\project_metamap\\mydata.json', orient='records')

