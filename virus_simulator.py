'''
This script simulates (rather simplistically) the spread of 
an infectious viral disease, according to 3 epidemiological 
indicators: 

- Basic reproduction number
- Serial interval
- Case fatality ratio

It the outputs a JSON file that can be used to visualize the
different stages of infection using data visualization packages
such as d3.js.
'''

##########################
### IMPORTING PACKAGES ###
##########################

import datetime, json, os
from numpy.random import normal, choice
from pprint import pprint

#######################
### VIRUS CONSTANTS ###
#######################

COVID19 = {
  
  "name" : "Covid-19",
  "r0"  : { "mean" : 2.6, "std" : 1 }, # Source: https://www.imperial.ac.uk/media/imperial-college/medicine/sph/ide/gida-fellowships/Imperial-2019-nCoV-transmissibility.pdf
  "si"  : { "mean" : 4.41, "std" : 1 }, # Assuming smallest interval from the OMS 19/02 report: 2.3 # Source: https://www.medrxiv.org/content/10.1101/2020.02.08.20021253v2
  "cfr" : { "mean" : .023, "std" : 1 } # Source:  https://www.who.int/docs/default-source/coronaviruse/situation-reports/20200219-sitrep-30-covid-19.pdf?sfvrsn=3346b04f_2
} 

COVID19_80_MORE = {

  "name" : "Covid-19-80-more-years",
  "r0"  : { "mean" : 2.6, "std" : 1 },
  "si"  : { "mean" : 4.41, "std" : 1 },
  "cfr" : { "mean" : .148 ,"std" : 1 } # Source: https://jamanetwork.com/journals/jama/fullarticle/2762130?guestAccessKey=bdcca6fa-a48c-4028-8406-7f3d04a3e932&utm_source=For_The_Media&utm_medium=referral&utm_campaign=ftm_links&utm_content=tfl&utm_term=022420

} 

COVID19_70_79 = {

  "name" : "Covid-19-70-to-79-years",
  "r0"  : { "mean" : 2.6, "std" : 1 }, 
  "si"  : { "mean" : 4.41, "std" : 1 }, 
  "cfr" : { "mean" : .08, "std" : 1 } # Source: https://jamanetwork.com/journals/jama/fullarticle/2762130?guestAccessKey=bdcca6fa-a48c-4028-8406-7f3d04a3e932&utm_source=For_The_Media&utm_medium=referral&utm_campaign=ftm_links&utm_content=tfl&utm_term=022420
  
}


H1N1_2009 = {

  "name" : "H1N1",
  "r0"  : { "mean" : 1.5, "std" : 1 }, # Source: https://www.ncbi.nlm.nih.gov/pubmed/19545404
  "si"  : { "mean" : 2.8, "std" : 1 }, # Source: https://academic.oup.com/aje/article/180/9/865/2739204
  "cfr" : { "mean" : .0002, "std" : 1 } # Source: https://onlinelibrary.wiley.com/doi/pdf/10.1111/irv.12074

}


SMALLPOX = {

  "name" : "Smallpox",
  "r0"  : { "mean" : 5, "std" : 1 }, # Source: https://www.ncbi.nlm.nih.gov/pubmed/11742399
  "si"  : { "mean" : 17.7, "std" : 1 }, # Source: https://academic.oup.com/aje/article/180/9/865/2739204
  "cfr" : { "mean" : .3, "std" : 1 } # Source: https://www.who.int/biologicals/vaccines/smallpox/en/
  

}

MEASLES = {
  
  "name" : "Measles",
  "r0"  : { "mean" : 15, "std" : 1 }, # Source: https://www.thelancet.com/pdfs/journals/laninf/PIIS1473-3099(17)30307-9.pdf, acknowledges huge variation
  "si"  : { "mean" : 11.7, "std" : 1 }, # Source: https://academic.oup.com/aje/article/180/9/865/2739204
  "cfr" : { "mean" : .002, "std" : 1 } # Source: https://www.cdc.gov/vaccines/pubs/pinkbook/meas.html

}

HYPOTHETIC_RO_GROWTH = {

  "name" : "Hypothetic-R0-1.5",
  "r0"  : { "mean" : 1.8, "std" : 1 }, # Source: https://www.thelancet.com/pdfs/journals/laninf/PIIS1473-3099(17)30307-9.pdf, acknowledges huge variation
  "si"  : { "mean" : 2, "std" : 0 }, # Source: https://academic.oup.com/aje/article/180/9/865/2739204
  "cfr" : { "mean" : 0, "std" : 0 } # Source: https://www.cdc.gov/vaccines/pubs/pinkbook/meas.html
  
}

HYPOTHETIC_RO_DIE_OUT = {

  "name" : "Hypothetic-R0-0.5",
  "r0"  : { "mean" : 0.9, "std" : 1 }, # Source: https://www.thelancet.com/pdfs/journals/laninf/PIIS1473-3099(17)30307-9.pdf, acknowledges huge variation
  "si"  : { "mean" : 2, "std" : 0 }, # Source: https://academic.oup.com/aje/article/180/9/865/2739204
  "cfr" : { "mean" : 0, "std" : 0 } # Source: https://www.cdc.gov/vaccines/pubs/pinkbook/meas.html

}

HYPOTHETIC_CONSTANT_R0 = {

  "name" : "Hypothetic-R0-Constant",
  "r0"  : { "mean" : 2, "std" : 0 }, # Source: https://www.thelancet.com/pdfs/journals/laninf/PIIS1473-3099(17)30307-9.pdf, acknowledges huge variation
  "si"  : { "mean" : 2, "std" : 0 }, # Source: https://academic.oup.com/aje/article/180/9/865/2739204
  "cfr" : { "mean" : 0, "std" : 0 } # Source: https://www.cdc.gov/vaccines/pubs/pinkbook/meas.html

}


# Note: othervise than when indicated, we assume that the standard deviations are 1

#####################
### MAIN FUNCTION ###
#####################

def main():


  # Prompts user for parameters
  virus = choose_virus()
  max_generations = choose_generations()

  # Runs the simulation
  data = run(virus, max_generations)

  # Saves the data on json format
  save(data, virus["name"])

########################
### HELPER FUNCTIONS ###
########################

def choose_virus():

  '''
  Prompts the user to select one of the
  viruses that we are able to simulate
  '''

  viruses = {

    "a" : COVID19,
    "b" : COVID19_70_79,
    "c" : COVID19_80_MORE,
    "d" : H1N1_2009,
    "e" : SMALLPOX,
    "f" : MEASLES,
    "g" : HYPOTHETIC_RO_GROWTH,
    "h" : HYPOTHETIC_RO_DIE_OUT,
    "i" : HYPOTHETIC_CONSTANT_R0,

  }

  virus = ''

  while virus not in viruses.keys():
    print("Please select one of the following viruses: ")
    
    for k,v in viruses.items():
      print(f"{k}) {v['name']}")
    
    virus = input()

    virus = ''.join(letter for letter in virus if letter.isalpha())
    
    print()

  virus = viruses[virus]

  return virus

def choose_generations():
  '''
  Prompts the user to select for how
  many generations of the virus the
  simulation should run
  '''

  max_generations = ""

  while not max_generations.isdigit():

    max_generations = input("For how many generations should this simulation run?\n")

  max_generations = int(max_generations)

  return max_generations

def infected_person(virus, infected_count):

  '''
  Creates a new infected person,
  represented by a dictionary,
  using the epidemiological
  indicators of the corresponding
  virus.
  '''

  # Which virus does this person have?
  virus_name = virus["name"],

  # How many more people should this person infect?
  to_infect = round(normal(virus["r0"]["mean"], virus["r0"]["std"]))

  # How long will it take for the next infected people appear?
  countdown = -1
  while countdown < 0:
    countdown =  round(normal(virus["si"]["mean"], virus["si"]["std"]))

  # Will this person survive?
  choices = (True, False)
  alive = bool(choice( choices, p = [ 1 - virus["cfr"]["mean"], virus["cfr"]["mean"] ])) # We cast to bool because np bools are not json serializable, while python bools are


  return {

    "id" : str(infected_count).zfill(4),

    "virus_name" : virus['name'],

    "to_infect" : to_infect,

    "countdown" : countdown,

    "alive" : alive,

    # Has this person finished his infective period?
    "resolved" : False,

    # Who infected this person? This will be determined later
    "parent" : None,

    # Who was infected by this person? This will be determined later
    "children" : [ ],

    # To which generation of the virus this person belongs? This will be determined later
    "generation" : None

  }

def run(virus, max_generations):

  # We start the simulation with our first infected person
  infected_count = 1

  case_zero = infected_person(virus, infected_count)
  case_zero["generation"] = 1

  # This array will be populated with the original infection case
  population = [ case_zero ]

  # If the we are using the hypothetic die out disease, populate with more
  if virus["name"] in [ "Hypothetic-R0-0.5", "Hypothetic-R0-1.5", "Hypothetic-R0-Constant" ] :
    print('This is an hypothetic virus that serve to demonstrate how the r0 works')

  # For each person in the population...
  for person in population:

    print(f"Looking at person #{person['id']}")

    if person["generation"] == max_generations:
      break

    # If this person is still infective...
    if not person["resolved"]:

      # We spread the disease...
      for i in range(person["to_infect"]):

        # First, add to the infection count, so we have an unique id
        infected_count += 1

        # Then creates the person and determine the parent
        new_person = infected_person(virus, infected_count)
        new_person["parent"] = person["id"]

        # The new person is one generation below his parent
        new_person["generation"] = person["generation"] + 1

        # Determine in which generation we are

        # And add to the population
        population.append(new_person)

        # Register the new person as a children of the parent
        person["children"].append(new_person["id"])

      # Mark the person as no longer infective
      person["resolved"] = True

  # Return the infection data
  print("Here is the data on the epidemy:")
  pprint(population)
  print()
  print(f"{len(population)} people were infected.")
  print()

  return population

def save(data, virus):
  '''
  Saves the data in the output directory.
  The filename will be in the format
  {VIRUSNAME.%Y-%m-%d.%H-%M-%S}
  '''

  if not os.path.exists("output/"):
    os.makedirs('output/')

  #fname = datetime.datetime.now().strftime('%Y-%m-%d.%H-%M')
  #fpath = f"output/{virus.lower()}.{fname}.json"
  fpath = f"output/{virus.lower()}.json"
  
  with open(fpath, "w+") as file:
    json.dump(data, file, indent = 4)

  print(f"The file was saved on {fpath}")

##############################
### EXECUTION STARTS BELOW ###
##############################

if __name__ == "__main__":

  main()