import pandas as pd
import numpy as np
import os

# import csv file 
dataset = pd.read_csv(os.path.join(os.path.dirname(__file__), 'data/emails.csv'))

print("Name of the columns is :", dataset.columns[0],",", dataset.columns[1])
print("Shape of the data is (rows, columns) :", dataset.shape)

dataset.drop_duplicates(inplace = True)
print("Shape of the data after removing duplicates (rows, columns) :", dataset.shape)
X = dataset['text']
y = dataset['spam'] 
# or y = dataset.iloc[:,1].values

# Creating the Bag of Words model
from sklearn.feature_extraction.text import CountVectorizer
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(X.values).toarray()


# Splitting the dataset into training set(80%) and testing set(20%)
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.20, random_state = 0)


# Fitting Gaussian naive bayes classifier to the Training set
from sklearn.naive_bayes import GaussianNB
classifier = GaussianNB()
classifier.fit(X_train, y_train)

# Predicting the Test set results
y_pred = classifier.predict(X_test)

# subset accuracy
from sklearn.metrics import accuracy_score
print(accuracy_score(y_test, y_pred,normalize=False),"correct predictions out of 200")

# checking accracy with cross validation (k-fold) and cv is the iteration count
from sklearn.model_selection import cross_val_score
accuracies = cross_val_score(estimator = classifier, X = X_train, y = y_train, cv = 5)
print("Mean accuracy = ",accuracies.mean())

#testing
# message = "Subject: perfect logo charset = koi 8 - r \" >  thinking of breathing new life into your business ?  start from revamping its front - end - logo and visuai identity .  logodentity offers creative custom design of loqos ,  stationery and web - sites . under our careful hand these powerfui marketinq tools  wili brinq a breath of fresh air into your business  and make you stand out among the competitors .  you are just a click  away from your future success . ciick here to see the samples of our artwork ,  check our prices and hot offers"
# message = vectorizer.fit_transform(message).toarray()

# prediction = classifier.predict(message)


# if(prediction == 1):
#     print("It is spam")
# else:
#     print("It is not spam")



# TODO: serialize and deserialize the model to avoid retraining of the model every time the script is called via node.js
# pickling or serializing the trained model
import pickle
filename = 'finalized_model.sav'
pickle.dump(classifier, open(filename, 'wb'))